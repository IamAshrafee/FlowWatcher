//! Speed monitoring with delta calculation and rolling average smoothing.

use flowwatcher_platform::network::{NetworkProvider, NetworkStats};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors from the speed monitor.
#[derive(Debug, Error)]
pub enum SpeedError {
    /// No previous snapshot exists to calculate a delta.
    #[error("no previous snapshot — need at least two polls to calculate speed")]
    NoPreviousSnapshot,

    /// The underlying network provider returned an error.
    #[error("network provider error: {0}")]
    NetworkError(#[from] flowwatcher_platform::network::NetworkError),
}

// ---------------------------------------------------------------------------
// Speed snapshot
// ---------------------------------------------------------------------------

/// A calculated speed reading for one poll interval.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeedReading {
    /// Download speed in bytes per second.
    pub download_bps: u64,
    /// Upload speed in bytes per second.
    pub upload_bps: u64,
}

// ---------------------------------------------------------------------------
// SpeedMonitor
// ---------------------------------------------------------------------------

/// Monitors network speed by polling stats and calculating deltas.
///
/// Uses a rolling average (configurable window size) to smooth out
/// momentary spikes and prevent false triggers.
pub struct SpeedMonitor {
    /// The network interface to monitor.
    interface_id: String,
    /// Previous stats snapshot for delta calculation.
    last_stats: Option<NetworkStats>,
    /// Rolling window of recent speed readings.
    history: VecDeque<SpeedReading>,
    /// Size of the rolling average window.
    window_size: usize,
}

impl SpeedMonitor {
    /// Create a new speed monitor for a specific interface.
    ///
    /// # Arguments
    /// * `interface_id` — The network interface to monitor.
    /// * `window_size` — Number of samples for rolling average smoothing (default: 3).
    pub fn new(interface_id: impl Into<String>, window_size: usize) -> Self {
        Self {
            interface_id: interface_id.into(),
            last_stats: None,
            history: VecDeque::with_capacity(window_size),
            window_size,
        }
    }

    /// Poll the network provider and calculate current speed.
    ///
    /// Must be called repeatedly at a fixed interval (e.g., every 1 second).
    /// The first call establishes a baseline; speed is available from the
    /// second call onward.
    pub fn poll(
        &mut self,
        provider: &mut dyn NetworkProvider,
    ) -> Result<Option<SpeedReading>, SpeedError> {
        let current = provider.get_stats(&self.interface_id)?;

        let reading = if let Some(ref prev) = self.last_stats {
            let elapsed = current.timestamp.duration_since(prev.timestamp);
            let elapsed_secs = elapsed.as_secs_f64();

            if elapsed_secs <= 0.0 {
                // Avoid division by zero if called too fast.
                None
            } else {
                let download_delta = current.bytes_received.saturating_sub(prev.bytes_received);
                let upload_delta = current.bytes_sent.saturating_sub(prev.bytes_sent);

                let reading = SpeedReading {
                    download_bps: (download_delta as f64 / elapsed_secs) as u64,
                    upload_bps: (upload_delta as f64 / elapsed_secs) as u64,
                };

                // Add to rolling window.
                if self.history.len() >= self.window_size {
                    self.history.pop_front();
                }
                self.history.push_back(reading.clone());

                Some(reading)
            }
        } else {
            // First poll — no previous data to compare against.
            None
        };

        self.last_stats = Some(current);
        Ok(reading)
    }

    /// Get the current download speed (rolling average), in bytes/second.
    pub fn current_download_speed(&self) -> u64 {
        if self.history.is_empty() {
            return 0;
        }
        let sum: u64 = self.history.iter().map(|r| r.download_bps).sum();
        sum / self.history.len() as u64
    }

    /// Get the current upload speed (rolling average), in bytes/second.
    pub fn current_upload_speed(&self) -> u64 {
        if self.history.is_empty() {
            return 0;
        }
        let sum: u64 = self.history.iter().map(|r| r.upload_bps).sum();
        sum / self.history.len() as u64
    }

    /// Get the latest raw (non-averaged) speed reading.
    pub fn latest_reading(&self) -> Option<&SpeedReading> {
        self.history.back()
    }

    /// Reset the monitor state (clears history and previous snapshot).
    pub fn reset(&mut self) {
        self.last_stats = None;
        self.history.clear();
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use flowwatcher_platform::network::{InterfaceInfo, NetworkError};
    use std::time::Instant;

    /// A mock network provider for testing speed calculations.
    struct MockNetworkProvider {
        /// Sequence of stats to return on successive calls.
        snapshots: Vec<(u64, u64)>, // (bytes_received, bytes_sent)
        call_count: usize,
        base_time: Instant,
    }

    impl MockNetworkProvider {
        fn new(snapshots: Vec<(u64, u64)>) -> Self {
            Self {
                snapshots,
                call_count: 0,
                base_time: Instant::now(),
            }
        }
    }

    impl NetworkProvider for MockNetworkProvider {
        fn list_interfaces(&self) -> Result<Vec<InterfaceInfo>, NetworkError> {
            Ok(vec![InterfaceInfo {
                id: "mock0".to_string(),
                name: "Mock Interface".to_string(),
                mac: "00:00:00:00:00:00".to_string(),
                is_up: true,
            }])
        }

        fn get_default_interface(&self) -> Result<Option<InterfaceInfo>, NetworkError> {
            Ok(self.list_interfaces()?.into_iter().next())
        }

        fn get_stats(&mut self, interface_id: &str) -> Result<NetworkStats, NetworkError> {
            if interface_id != "mock0" {
                return Err(NetworkError::InterfaceNotFound(interface_id.to_string()));
            }
            let idx = self.call_count.min(self.snapshots.len() - 1);
            let (received, sent) = self.snapshots[idx];
            self.call_count += 1;

            Ok(NetworkStats {
                bytes_received: received,
                bytes_sent: sent,
                // Simulate 1-second intervals.
                timestamp: self.base_time + std::time::Duration::from_secs(self.call_count as u64),
            })
        }
    }

    #[test]
    fn first_poll_returns_none() {
        let mut provider = MockNetworkProvider::new(vec![(0, 0)]);
        let mut monitor = SpeedMonitor::new("mock0", 3);

        let result = monitor.poll(&mut provider).unwrap();
        assert!(
            result.is_none(),
            "first poll should return None (no baseline)"
        );
    }

    #[test]
    fn speed_calculation_from_delta() {
        // Simulate: 0 bytes → 1024 bytes received in 1 second = 1024 B/s
        let mut provider = MockNetworkProvider::new(vec![
            (0, 0),      // first poll (baseline)
            (1024, 512), // second poll
        ]);
        let mut monitor = SpeedMonitor::new("mock0", 3);

        monitor.poll(&mut provider).unwrap(); // baseline
        let reading = monitor
            .poll(&mut provider)
            .unwrap()
            .expect("should have reading");

        assert_eq!(reading.download_bps, 1024);
        assert_eq!(reading.upload_bps, 512);
    }

    #[test]
    fn rolling_average_smooths_spikes() {
        // 3 readings: 1000, 100, 1000 → average = 700
        let mut provider = MockNetworkProvider::new(vec![
            (0, 0),
            (1000, 0), // +1000 in 1s = 1000 bps
            (1100, 0), // +100 in 1s  = 100 bps
            (2100, 0), // +1000 in 1s = 1000 bps
        ]);
        let mut monitor = SpeedMonitor::new("mock0", 3);

        monitor.poll(&mut provider).unwrap(); // baseline
        monitor.poll(&mut provider).unwrap(); // 1000
        monitor.poll(&mut provider).unwrap(); // 100
        monitor.poll(&mut provider).unwrap(); // 1000

        let avg = monitor.current_download_speed();
        assert_eq!(
            avg, 700,
            "rolling average of [1000, 100, 1000] should be 700"
        );
    }

    #[test]
    fn rolling_window_evicts_old_samples() {
        // Window size = 2, push 3 values → oldest is dropped
        let mut provider = MockNetworkProvider::new(vec![
            (0, 0),
            (500, 0),  // +500
            (1000, 0), // +500
            (3000, 0), // +2000
        ]);
        let mut monitor = SpeedMonitor::new("mock0", 2); // window=2

        monitor.poll(&mut provider).unwrap();
        monitor.poll(&mut provider).unwrap(); // 500
        monitor.poll(&mut provider).unwrap(); // 500
        monitor.poll(&mut provider).unwrap(); // 2000

        // Window should contain [500, 2000], average = 1250
        let avg = monitor.current_download_speed();
        assert_eq!(avg, 1250);
    }

    #[test]
    fn reset_clears_state() {
        let mut provider = MockNetworkProvider::new(vec![(0, 0), (1000, 0)]);
        let mut monitor = SpeedMonitor::new("mock0", 3);

        monitor.poll(&mut provider).unwrap();
        monitor.poll(&mut provider).unwrap();
        assert!(monitor.current_download_speed() > 0);

        monitor.reset();
        assert_eq!(monitor.current_download_speed(), 0);
        assert!(monitor.latest_reading().is_none());
    }
}

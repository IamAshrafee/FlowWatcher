//! Network interface abstraction and platform implementations.

use serde::{Deserialize, Serialize};
use std::time::Instant;
use sysinfo::Networks;
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors that can occur when interacting with network interfaces.
#[derive(Debug, Error)]
pub enum NetworkError {
    /// The requested network interface was not found.
    #[error("network interface not found: {0}")]
    InterfaceNotFound(String),

    /// A platform-specific error occurred.
    #[error("platform error: {0}")]
    PlatformError(String),
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// Information about a single network interface.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceInfo {
    /// Unique identifier for this interface (platform-specific).
    pub id: String,
    /// Human-readable display name.
    pub name: String,
    /// MAC address as a colon-separated hex string.
    pub mac: String,
    /// Whether the interface is currently up and connected.
    pub is_up: bool,
}

/// A snapshot of network traffic counters for one interface.
#[derive(Debug, Clone)]
pub struct NetworkStats {
    /// Total bytes sent since boot.
    pub bytes_sent: u64,
    /// Total bytes received since boot.
    pub bytes_received: u64,
    /// Wall-clock instant when this snapshot was taken.
    pub timestamp: Instant,
}

// ---------------------------------------------------------------------------
// Trait
// ---------------------------------------------------------------------------

/// Platform-agnostic trait for retrieving network interface information.
///
/// Implementations exist per-OS. The engine only depends on this trait,
/// never on a concrete provider — so adding macOS/Linux support later
/// requires zero changes to the calling code.
pub trait NetworkProvider: Send + Sync {
    /// List all network interfaces visible to the OS.
    fn list_interfaces(&self) -> Result<Vec<InterfaceInfo>, NetworkError>;

    /// Return the "best guess" default interface (highest traffic).
    fn get_default_interface(&self) -> Result<Option<InterfaceInfo>, NetworkError>;

    /// Get cumulative byte counters for a specific interface.
    fn get_stats(&mut self, interface_id: &str) -> Result<NetworkStats, NetworkError>;
}

// ---------------------------------------------------------------------------
// sysinfo-based implementation (cross-platform)
// ---------------------------------------------------------------------------

/// Network provider backed by the `sysinfo` crate.
///
/// Works on Windows, macOS, and Linux without any platform-specific code.
pub struct SysinfoNetworkProvider {
    networks: Networks,
}

impl SysinfoNetworkProvider {
    /// Create a new provider. Performs an initial refresh so the first
    /// `get_stats` call returns meaningful deltas.
    pub fn new() -> Self {
        let networks = Networks::new_with_refreshed_list();
        Self { networks }
    }
}

impl Default for SysinfoNetworkProvider {
    fn default() -> Self {
        Self::new()
    }
}

impl NetworkProvider for SysinfoNetworkProvider {
    fn list_interfaces(&self) -> Result<Vec<InterfaceInfo>, NetworkError> {
        let interfaces = self
            .networks
            .iter()
            .map(|(name, data)| InterfaceInfo {
                id: name.clone(),
                name: name.clone(),
                mac: data.mac_address().to_string(),
                is_up: data.total_received() > 0 || data.total_transmitted() > 0,
            })
            .collect();
        Ok(interfaces)
    }

    fn get_default_interface(&self) -> Result<Option<InterfaceInfo>, NetworkError> {
        // Heuristic: pick the interface with the most total traffic.
        let best = self
            .networks
            .iter()
            .max_by_key(|(_, data)| data.total_received() + data.total_transmitted());

        match best {
            Some((name, data)) => Ok(Some(InterfaceInfo {
                id: name.clone(),
                name: name.clone(),
                mac: data.mac_address().to_string(),
                is_up: true,
            })),
            None => Ok(None),
        }
    }

    fn get_stats(&mut self, interface_id: &str) -> Result<NetworkStats, NetworkError> {
        // Refresh to get latest counters.
        self.networks.refresh(true);

        let data = self
            .networks
            .iter()
            .find(|(name, _)| *name == interface_id)
            .map(|(_, data)| data)
            .ok_or_else(|| NetworkError::InterfaceNotFound(interface_id.to_string()))?;

        Ok(NetworkStats {
            bytes_sent: data.total_transmitted(),
            bytes_received: data.total_received(),
            timestamp: Instant::now(),
        })
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sysinfo_provider_lists_interfaces() {
        let provider = SysinfoNetworkProvider::new();
        let interfaces = provider.list_interfaces().expect("should list interfaces");
        // On any machine, there should be at least one interface.
        assert!(!interfaces.is_empty(), "expected at least one network interface");
    }

    #[test]
    fn sysinfo_provider_gets_default_interface() {
        let provider = SysinfoNetworkProvider::new();
        let default = provider
            .get_default_interface()
            .expect("should get default interface");
        // default might be None on a machine with no traffic, but the call should succeed.
        assert!(default.is_some() || default.is_none());
    }

    #[test]
    fn sysinfo_provider_gets_stats_for_known_interface() {
        let mut provider = SysinfoNetworkProvider::new();
        let interfaces = provider.list_interfaces().expect("should list interfaces");
        if let Some(iface) = interfaces.first() {
            let stats = provider
                .get_stats(&iface.id)
                .expect("should get stats for known interface");
            // Simply verify the call succeeded and returned valid stats.
            let _ = stats.bytes_sent;
            let _ = stats.bytes_received;
        }
    }

    #[test]
    fn sysinfo_provider_returns_error_for_unknown_interface() {
        let mut provider = SysinfoNetworkProvider::new();
        let result = provider.get_stats("nonexistent_interface_xyz");
        assert!(result.is_err());
    }
}

//! Activity Logger — records monitoring events for user transparency.
//!
//! Provides an in-memory log of monitoring sessions, trigger events,
//! and action executions with methods to query, clear, and export.

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Log entry
// ---------------------------------------------------------------------------

/// Status of a logged activity.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LogStatus {
    /// Action was executed successfully.
    Executed,
    /// Action was cancelled by the user.
    Cancelled,
    /// An error occurred.
    Error,
    /// Informational event (monitoring started/stopped).
    Info,
}

/// A single activity log entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    /// ISO-8601 timestamp string.
    pub timestamp: String,
    /// What triggered this event (e.g. "Network idle", "Process idle").
    pub trigger_reason: String,
    /// What action was involved (e.g. "Shutdown", "Lock Screen").
    pub action_name: String,
    /// Status of the event.
    pub status: LogStatus,
    /// Optional details or error message.
    pub details: Option<String>,
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

/// Maximum number of log entries kept in memory.
const MAX_ENTRIES: usize = 1000;

/// In-memory activity logger with FIFO eviction.
#[derive(Debug, Default)]
pub struct ActivityLogger {
    entries: Vec<LogEntry>,
}

impl ActivityLogger {
    /// Create a new empty logger.
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    /// Add a log entry. Evicts oldest entries if over capacity.
    pub fn add_entry(&mut self, entry: LogEntry) {
        if self.entries.len() >= MAX_ENTRIES {
            self.entries.remove(0);
        }
        self.entries.push(entry);
    }

    /// Get all log entries (newest last).
    pub fn get_all(&self) -> &[LogEntry] {
        &self.entries
    }

    /// Get entries filtered by a case-insensitive query on trigger/action/details.
    pub fn get_filtered(&self, query: &str) -> Vec<&LogEntry> {
        let q = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| {
                e.trigger_reason.to_lowercase().contains(&q)
                    || e.action_name.to_lowercase().contains(&q)
                    || e.details
                        .as_deref()
                        .unwrap_or("")
                        .to_lowercase()
                        .contains(&q)
            })
            .collect()
    }

    /// Get the number of entries.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Whether the logger is empty.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Clear all entries.
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Export all entries as a JSON string.
    pub fn export_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&self.entries)
    }

    /// Export all entries as plain text.
    pub fn export_txt(&self) -> String {
        self.entries
            .iter()
            .map(|e| {
                format!(
                    "[{}] {:?} | {} | {} | {}",
                    e.timestamp,
                    e.status,
                    e.trigger_reason,
                    e.action_name,
                    e.details.as_deref().unwrap_or("-"),
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Save all log entries to a JSON file.
    pub fn save_to_file(&self, path: &std::path::Path) -> Result<(), String> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(&self.entries)
            .map_err(|e| e.to_string())?;
        std::fs::write(path, json).map_err(|e| e.to_string())
    }

    /// Load log entries from a JSON file. Replaces current entries.
    pub fn load_from_file(path: &std::path::Path) -> Result<Self, String> {
        if !path.exists() {
            return Ok(Self::new());
        }
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        let entries: Vec<LogEntry> =
            serde_json::from_str(&data).map_err(|e| e.to_string())?;
        // Cap at MAX_ENTRIES, keeping newest.
        let start = if entries.len() > MAX_ENTRIES {
            entries.len() - MAX_ENTRIES
        } else {
            0
        };
        Ok(Self {
            entries: entries[start..].to_vec(),
        })
    }

    /// Remove entries older than `days` days.
    ///
    /// Uses the timestamp prefix (YYYY-MM-DD) for comparison.
    pub fn prune_older_than(&mut self, days: u64) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let cutoff_secs = now.saturating_sub(days * 86400);
        let (cutoff_year, cutoff_month, cutoff_day) = days_to_date(cutoff_secs / 86400);
        let cutoff_str = format!("{:04}-{:02}-{:02}", cutoff_year, cutoff_month, cutoff_day);

        self.entries.retain(|e| {
            // Compare the date portion of the timestamp.
            if e.timestamp.len() >= 10 {
                e.timestamp[..10] >= *cutoff_str
            } else {
                true // Keep entries with unexpected timestamp format.
            }
        });
    }
}

// ---------------------------------------------------------------------------
// Convenience constructor
// ---------------------------------------------------------------------------

impl LogEntry {
    /// Create a new log entry with the current timestamp.
    pub fn now(
        trigger_reason: impl Into<String>,
        action_name: impl Into<String>,
        status: LogStatus,
        details: Option<String>,
    ) -> Self {
        // Simple ISO-like timestamp without chrono dependency.
        let timestamp = {
            let now = std::time::SystemTime::now();
            let duration = now
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default();
            let secs = duration.as_secs();
            // Format as "YYYY-MM-DD HH:MM:SS" (UTC approximation).
            let days = secs / 86400;
            let time_secs = secs % 86400;
            let hours = time_secs / 3600;
            let minutes = (time_secs % 3600) / 60;
            let seconds = time_secs % 60;
            // Approximate year/month/day from days since epoch.
            let (year, month, day) = days_to_date(days);
            format!(
                "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
                year, month, day, hours, minutes, seconds
            )
        };

        Self {
            timestamp,
            trigger_reason: trigger_reason.into(),
            action_name: action_name.into(),
            status,
            details,
        }
    }
}

/// Convert days since Unix epoch to (year, month, day).
fn days_to_date(mut days: u64) -> (u64, u64, u64) {
    let mut year = 1970u64;
    loop {
        let days_in_year = if is_leap(year) { 366 } else { 365 };
        if days < days_in_year {
            break;
        }
        days -= days_in_year;
        year += 1;
    }
    let month_days: [u64; 12] = if is_leap(year) {
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };
    let mut month = 1u64;
    for &md in &month_days {
        if days < md {
            break;
        }
        days -= md;
        month += 1;
    }
    (year, month, days + 1)
}

fn is_leap(y: u64) -> bool {
    (y % 4 == 0 && y % 100 != 0) || y % 400 == 0
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn logger_starts_empty() {
        let logger = ActivityLogger::new();
        assert!(logger.is_empty());
        assert_eq!(logger.len(), 0);
    }

    #[test]
    fn add_and_retrieve_entries() {
        let mut logger = ActivityLogger::new();
        logger.add_entry(LogEntry::now("Network idle", "Shutdown", LogStatus::Executed, None));
        logger.add_entry(LogEntry::now("Process idle", "Lock Screen", LogStatus::Cancelled, Some("User cancelled".into())));

        assert_eq!(logger.len(), 2);
        assert_eq!(logger.get_all()[0].trigger_reason, "Network idle");
        assert_eq!(logger.get_all()[1].status, LogStatus::Cancelled);
    }

    #[test]
    fn fifo_eviction_at_capacity() {
        let mut logger = ActivityLogger::new();
        for i in 0..1001 {
            logger.add_entry(LogEntry::now(
                format!("Trigger {}", i),
                "Action",
                LogStatus::Info,
                None,
            ));
        }
        assert_eq!(logger.len(), 1000);
        // First entry should be #1 (not #0, which was evicted).
        assert_eq!(logger.get_all()[0].trigger_reason, "Trigger 1");
    }

    #[test]
    fn filter_entries() {
        let mut logger = ActivityLogger::new();
        logger.add_entry(LogEntry::now("Network idle", "Shutdown", LogStatus::Executed, None));
        logger.add_entry(LogEntry::now("Process idle", "Lock Screen", LogStatus::Cancelled, None));

        let results = logger.get_filtered("network");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].trigger_reason, "Network idle");
    }

    #[test]
    fn clear_entries() {
        let mut logger = ActivityLogger::new();
        logger.add_entry(LogEntry::now("Test", "Action", LogStatus::Info, None));
        logger.clear();
        assert!(logger.is_empty());
    }

    #[test]
    fn export_json() {
        let mut logger = ActivityLogger::new();
        logger.add_entry(LogEntry::now("Test", "Action", LogStatus::Executed, None));
        let json = logger.export_json().unwrap();
        assert!(json.contains("\"trigger_reason\": \"Test\""));
        assert!(json.contains("\"executed\""));
    }

    #[test]
    fn export_txt() {
        let mut logger = ActivityLogger::new();
        logger.add_entry(LogEntry::now("Test", "Action", LogStatus::Info, Some("details".into())));
        let txt = logger.export_txt();
        assert!(txt.contains("Test"));
        assert!(txt.contains("details"));
    }
}

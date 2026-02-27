//! Process enumeration and network usage monitoring.
//!
//! Provides process listing, per-process network usage estimation,
//! and smart suggestion logic for identifying high-traffic processes.

use serde::{Deserialize, Serialize};
use sysinfo::{Process, System};
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors that can occur during process operations.
#[derive(Debug, Error)]
pub enum ProcessError {
    /// The requested process was not found.
    #[error("process not found: pid {0}")]
    ProcessNotFound(u32),

    /// A platform-specific error occurred.
    #[error("platform error: {0}")]
    PlatformError(String),
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// Information about a running process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    /// Process ID.
    pub pid: u32,
    /// Process name (e.g., "steam.exe").
    pub name: String,
    /// Full path to the executable (if available).
    pub path: Option<String>,
    /// Estimated network usage in bytes (combined read+write disk I/O as proxy).
    /// Note: True per-process network usage requires ETW on Windows, which is
    /// complex. We use disk I/O as an initial proxy and can upgrade later.
    pub estimated_network_bytes: u64,
    /// Whether this process is suggested as a high-traffic candidate.
    pub is_suggested: bool,
}

// ---------------------------------------------------------------------------
// Process provider trait
// ---------------------------------------------------------------------------

/// Platform-agnostic trait for process enumeration and monitoring.
pub trait ProcessProvider: Send + Sync {
    /// List all running processes with their info.
    fn list_processes(&mut self) -> Result<Vec<ProcessInfo>, ProcessError>;

    /// Get info for a specific process by PID.
    fn get_process(&mut self, pid: u32) -> Result<ProcessInfo, ProcessError>;

    /// Get smart suggestions — processes sorted by network usage descending,
    /// with the top N marked as suggested.
    fn get_suggestions(&mut self, top_n: usize) -> Result<Vec<ProcessInfo>, ProcessError>;
}

// ---------------------------------------------------------------------------
// sysinfo-based implementation
// ---------------------------------------------------------------------------

/// Process provider backed by the `sysinfo` crate.
pub struct SysinfoProcessProvider {
    system: System,
}

impl SysinfoProcessProvider {
    /// Create a new provider with an initial process list refresh.
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();
        Self { system }
    }

    /// Convert a sysinfo Process to our ProcessInfo.
    fn to_process_info(pid: u32, process: &Process) -> ProcessInfo {
        let disk_usage = process.disk_usage();
        let estimated_bytes = disk_usage.read_bytes + disk_usage.written_bytes;

        ProcessInfo {
            pid,
            name: process.name().to_string_lossy().to_string(),
            path: process.exe().map(|p| p.to_string_lossy().to_string()),
            estimated_network_bytes: estimated_bytes,
            is_suggested: false,
        }
    }
}

impl Default for SysinfoProcessProvider {
    fn default() -> Self {
        Self::new()
    }
}

impl ProcessProvider for SysinfoProcessProvider {
    fn list_processes(&mut self) -> Result<Vec<ProcessInfo>, ProcessError> {
        self.system.refresh_all();

        let processes = self
            .system
            .processes()
            .iter()
            .map(|(pid, process)| Self::to_process_info(pid.as_u32(), process))
            .collect();

        Ok(processes)
    }

    fn get_process(&mut self, pid: u32) -> Result<ProcessInfo, ProcessError> {
        self.system.refresh_all();

        let sysinfo_pid = sysinfo::Pid::from_u32(pid);
        self.system
            .process(sysinfo_pid)
            .map(|p| Self::to_process_info(pid, p))
            .ok_or(ProcessError::ProcessNotFound(pid))
    }

    fn get_suggestions(&mut self, top_n: usize) -> Result<Vec<ProcessInfo>, ProcessError> {
        let mut processes = self.list_processes()?;

        // Sort by estimated network bytes descending.
        processes.sort_by(|a, b| b.estimated_network_bytes.cmp(&a.estimated_network_bytes));

        // Mark top N as suggested.
        for (i, process) in processes.iter_mut().enumerate() {
            process.is_suggested = i < top_n;
        }

        Ok(processes)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sysinfo_provider_lists_processes() {
        let mut provider = SysinfoProcessProvider::new();
        let processes = provider.list_processes().expect("should list processes");
        // On any running machine, there should be many processes.
        assert!(!processes.is_empty(), "expected running processes");
    }

    #[test]
    fn sysinfo_provider_gets_current_process() {
        let mut provider = SysinfoProcessProvider::new();
        let current_pid = std::process::id();
        let info = provider
            .get_process(current_pid)
            .expect("should find current process");
        assert_eq!(info.pid, current_pid);
    }

    #[test]
    fn sysinfo_provider_returns_error_for_nonexistent_pid() {
        let mut provider = SysinfoProcessProvider::new();
        let result = provider.get_process(u32::MAX);
        assert!(result.is_err());
    }

    #[test]
    fn suggestions_sorted_by_usage_descending() {
        let mut provider = SysinfoProcessProvider::new();
        let suggestions = provider.get_suggestions(5).expect("should get suggestions");

        // Verify sorted descending.
        for window in suggestions.windows(2) {
            assert!(
                window[0].estimated_network_bytes >= window[1].estimated_network_bytes,
                "suggestions should be sorted descending"
            );
        }

        // Verify top 5 are marked as suggested.
        for (i, s) in suggestions.iter().enumerate() {
            if i < 5 {
                assert!(s.is_suggested, "top 5 should be suggested");
            }
        }
    }
}

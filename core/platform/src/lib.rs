//! Platform abstraction layer for FlowWatcher.
//!
//! Provides traits and implementations for OS-level operations like
//! network interface querying and stats collection. Currently supports
//! Windows via the `sysinfo` crate; macOS/Linux can be added by
//! implementing the same traits.

pub mod network;

pub use network::{InterfaceInfo, NetworkProvider, NetworkStats, SysinfoNetworkProvider};

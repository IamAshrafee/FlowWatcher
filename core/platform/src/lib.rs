//! Platform abstraction layer for FlowWatcher.
//!
//! Provides traits and implementations for OS-level operations like
//! network interface querying, stats collection, and system actions.
//! Currently supports Windows; macOS/Linux can be added by
//! implementing the same traits.

pub mod actions;
pub mod network;

pub use actions::{
    all_system_actions, HibernateAction, LockScreenAction, RestartAction, ShutdownAction,
    SignOutAction, SleepAction,
};
pub use network::{InterfaceInfo, NetworkProvider, NetworkStats, SysinfoNetworkProvider};

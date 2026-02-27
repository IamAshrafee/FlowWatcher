//! FlowWatcher Engine — the core orchestrator.
//!
//! Contains the [`SpeedMonitor`] which polls network stats, calculates
//! speed deltas, and applies rolling average smoothing.
//!
//! This crate depends on `flowwatcher-platform` for data,
//! `flowwatcher-triggers` for the trigger trait, and
//! `flowwatcher-conditions` for condition evaluation.

pub mod speed;

pub use speed::SpeedMonitor;

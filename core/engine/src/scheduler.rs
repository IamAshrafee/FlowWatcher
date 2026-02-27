//! Action scheduler with countdown, pre-warning, and cancellation.
//!
//! Implements a state machine: `Idle → Pending → Countdown → Executed | Cancelled`
//! with event emission at each transition.

use serde::{Deserialize, Serialize};
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors from the action scheduler.
#[derive(Debug, Error)]
pub enum SchedulerError {
    /// Cannot perform the requested operation in the current state.
    #[error("invalid state transition: cannot {action} while in {state} state")]
    InvalidState {
        /// What was attempted.
        action: String,
        /// Current state.
        state: String,
    },

    /// The underlying action failed.
    #[error("action error: {0}")]
    ActionError(String),
}

// ---------------------------------------------------------------------------
// Scheduler state
// ---------------------------------------------------------------------------

/// The current state of the action scheduler.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SchedulerState {
    /// No action is scheduled.
    Idle,
    /// An action has been scheduled but the pre-warning period hasn't started.
    Pending,
    /// Countdown is active — the action will execute when it reaches zero.
    Countdown,
    /// The action was successfully executed.
    Executed,
    /// The action was cancelled before execution.
    Cancelled,
}

impl std::fmt::Display for SchedulerState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Idle => write!(f, "Idle"),
            Self::Pending => write!(f, "Pending"),
            Self::Countdown => write!(f, "Countdown"),
            Self::Executed => write!(f, "Executed"),
            Self::Cancelled => write!(f, "Cancelled"),
        }
    }
}

// ---------------------------------------------------------------------------
// Scheduler events
// ---------------------------------------------------------------------------

/// Events emitted by the scheduler at state transitions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchedulerEvent {
    /// A pre-warning before the countdown starts.
    PreWarning {
        /// Seconds until countdown begins.
        seconds_until_countdown: u64,
    },
    /// The countdown has started.
    CountdownStarted {
        /// Total countdown duration in seconds.
        total_seconds: u64,
    },
    /// A tick during the countdown.
    CountdownTick {
        /// Seconds remaining.
        remaining_seconds: u64,
    },
    /// The scheduled action was cancelled.
    Cancelled,
    /// The action was executed.
    Executed,
}

// ---------------------------------------------------------------------------
// ActionScheduler
// ---------------------------------------------------------------------------

/// Schedules and manages the execution of an action with safety controls.
///
/// # State Machine
///
/// ```text
/// Idle → Pending → Countdown → Executed
///           ↓          ↓
///       Cancelled  Cancelled
/// ```
///
/// - Pre-warning event is emitted during `Pending` state.
/// - Countdown ticks are emitted during `Countdown` state.
/// - `cancel()` can be called in `Pending` or `Countdown` states.
/// - `execute_now()` can be called during `Countdown` to skip remaining time.
pub struct ActionScheduler {
    /// Current state of the scheduler.
    state: SchedulerState,
    /// Pre-warning duration in seconds (time before countdown starts).
    pre_warning_secs: u64,
    /// Countdown duration in seconds.
    countdown_secs: u64,
    /// Accumulated events (consumed by the caller).
    events: Vec<SchedulerEvent>,
    /// Seconds elapsed in the current phase (pending or countdown).
    elapsed_secs: u64,
}

impl ActionScheduler {
    /// Create a new scheduler.
    ///
    /// # Arguments
    /// * `pre_warning_secs` — Seconds of pre-warning before countdown (e.g., 60).
    /// * `countdown_secs` — Countdown duration in seconds (e.g., 30).
    pub fn new(pre_warning_secs: u64, countdown_secs: u64) -> Self {
        Self {
            state: SchedulerState::Idle,
            pre_warning_secs,
            countdown_secs,
            events: Vec::new(),
            elapsed_secs: 0,
        }
    }

    /// Get the current state.
    pub fn state(&self) -> SchedulerState {
        self.state
    }

    /// Drain all pending events.
    pub fn take_events(&mut self) -> Vec<SchedulerEvent> {
        std::mem::take(&mut self.events)
    }

    /// Schedule an action. Transitions from `Idle` → `Pending`.
    pub fn schedule(&mut self) -> Result<(), SchedulerError> {
        if self.state != SchedulerState::Idle && self.state != SchedulerState::Cancelled {
            return Err(SchedulerError::InvalidState {
                action: "schedule".to_string(),
                state: self.state.to_string(),
            });
        }

        self.state = SchedulerState::Pending;
        self.elapsed_secs = 0;
        self.events.push(SchedulerEvent::PreWarning {
            seconds_until_countdown: self.pre_warning_secs,
        });

        Ok(())
    }

    /// Advance the scheduler by one tick (typically 1 second).
    ///
    /// Returns `true` if the action should now be executed.
    pub fn tick(&mut self) -> Result<bool, SchedulerError> {
        match self.state {
            SchedulerState::Pending => {
                self.elapsed_secs += 1;
                if self.elapsed_secs >= self.pre_warning_secs {
                    // Transition to Countdown.
                    self.state = SchedulerState::Countdown;
                    self.elapsed_secs = 0;
                    self.events.push(SchedulerEvent::CountdownStarted {
                        total_seconds: self.countdown_secs,
                    });
                }
                Ok(false)
            }
            SchedulerState::Countdown => {
                self.elapsed_secs += 1;
                let remaining = self.countdown_secs.saturating_sub(self.elapsed_secs);

                self.events.push(SchedulerEvent::CountdownTick {
                    remaining_seconds: remaining,
                });

                if remaining == 0 {
                    self.state = SchedulerState::Executed;
                    self.events.push(SchedulerEvent::Executed);
                    Ok(true) // Caller should execute the action now.
                } else {
                    Ok(false)
                }
            }
            _ => Ok(false),
        }
    }

    /// Cancel the scheduled action.
    pub fn cancel(&mut self) -> Result<(), SchedulerError> {
        match self.state {
            SchedulerState::Pending | SchedulerState::Countdown => {
                self.state = SchedulerState::Cancelled;
                self.elapsed_secs = 0;
                self.events.push(SchedulerEvent::Cancelled);
                Ok(())
            }
            _ => Err(SchedulerError::InvalidState {
                action: "cancel".to_string(),
                state: self.state.to_string(),
            }),
        }
    }

    /// Skip the countdown and mark as ready to execute immediately.
    ///
    /// Returns `true` to indicate the caller should execute the action now.
    pub fn execute_now(&mut self) -> Result<bool, SchedulerError> {
        match self.state {
            SchedulerState::Pending | SchedulerState::Countdown => {
                self.state = SchedulerState::Executed;
                self.elapsed_secs = 0;
                self.events.push(SchedulerEvent::Executed);
                Ok(true)
            }
            _ => Err(SchedulerError::InvalidState {
                action: "execute_now".to_string(),
                state: self.state.to_string(),
            }),
        }
    }

    /// Reset the scheduler back to `Idle`. Can be called from any state.
    pub fn reset(&mut self) {
        self.state = SchedulerState::Idle;
        self.elapsed_secs = 0;
        self.events.clear();
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scheduler_starts_idle() {
        let scheduler = ActionScheduler::new(60, 30);
        assert_eq!(scheduler.state(), SchedulerState::Idle);
    }

    #[test]
    fn schedule_transitions_to_pending() {
        let mut scheduler = ActionScheduler::new(60, 30);
        scheduler.schedule().expect("should schedule");
        assert_eq!(scheduler.state(), SchedulerState::Pending);

        let events = scheduler.take_events();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], SchedulerEvent::PreWarning { .. }));
    }

    #[test]
    fn pending_transitions_to_countdown_after_pre_warning() {
        let mut scheduler = ActionScheduler::new(3, 2); // 3s pre-warn, 2s countdown

        scheduler.schedule().unwrap();
        scheduler.take_events(); // consume PreWarning

        // Tick 3 times to exhaust pre-warning.
        for _ in 0..3 {
            let should_exec = scheduler.tick().unwrap();
            assert!(!should_exec);
        }

        assert_eq!(scheduler.state(), SchedulerState::Countdown);
        let events = scheduler.take_events();
        assert!(events
            .iter()
            .any(|e| matches!(e, SchedulerEvent::CountdownStarted { .. })));
    }

    #[test]
    fn countdown_transitions_to_executed() {
        let mut scheduler = ActionScheduler::new(0, 3); // No pre-warn, 3s countdown

        scheduler.schedule().unwrap();
        // First tick transitions from Pending→Countdown (pre_warn=0).
        // But actually with pre_warning_secs=0, the first tick should transition immediately.
        // Let's tick:
        scheduler.tick().unwrap(); // Transitions to Countdown
        assert_eq!(scheduler.state(), SchedulerState::Countdown);

        // Now tick through countdown.
        scheduler.tick().unwrap(); // remaining=2
        scheduler.tick().unwrap(); // remaining=1
        let should_exec = scheduler.tick().unwrap(); // remaining=0 → Executed
        assert!(should_exec);
        assert_eq!(scheduler.state(), SchedulerState::Executed);
    }

    #[test]
    fn cancel_during_pending() {
        let mut scheduler = ActionScheduler::new(60, 30);
        scheduler.schedule().unwrap();
        scheduler.cancel().expect("should cancel");
        assert_eq!(scheduler.state(), SchedulerState::Cancelled);

        let events = scheduler.take_events();
        assert!(events.iter().any(|e| matches!(e, SchedulerEvent::Cancelled)));
    }

    #[test]
    fn cancel_during_countdown() {
        let mut scheduler = ActionScheduler::new(0, 30);
        scheduler.schedule().unwrap();
        scheduler.tick().unwrap(); // → Countdown
        scheduler.cancel().expect("should cancel");
        assert_eq!(scheduler.state(), SchedulerState::Cancelled);
    }

    #[test]
    fn execute_now_during_countdown() {
        let mut scheduler = ActionScheduler::new(0, 30);
        scheduler.schedule().unwrap();
        scheduler.tick().unwrap(); // → Countdown

        let should_exec = scheduler.execute_now().unwrap();
        assert!(should_exec);
        assert_eq!(scheduler.state(), SchedulerState::Executed);
    }

    #[test]
    fn cannot_schedule_while_pending() {
        let mut scheduler = ActionScheduler::new(60, 30);
        scheduler.schedule().unwrap();
        assert!(scheduler.schedule().is_err());
    }

    #[test]
    fn cannot_cancel_while_idle() {
        let mut scheduler = ActionScheduler::new(60, 30);
        assert!(scheduler.cancel().is_err());
    }

    #[test]
    fn reset_returns_to_idle() {
        let mut scheduler = ActionScheduler::new(60, 30);
        scheduler.schedule().unwrap();
        scheduler.reset();
        assert_eq!(scheduler.state(), SchedulerState::Idle);
    }

    #[test]
    fn can_reschedule_after_cancel() {
        let mut scheduler = ActionScheduler::new(60, 30);
        scheduler.schedule().unwrap();
        scheduler.cancel().unwrap();
        scheduler.schedule().expect("should reschedule after cancel");
        assert_eq!(scheduler.state(), SchedulerState::Pending);
    }
}

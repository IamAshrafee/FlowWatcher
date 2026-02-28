/**
 * App Shell — the main layout wrapper.
 *
 * Contains the titlebar area, pill tab navigation,
 * and content area with fade transitions.
 */

import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMonitoringStore } from '@/stores/monitoringStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TabId = 'dashboard' | 'advanced' | 'logs' | 'settings';

const TAB_IDS: TabId[] = ['dashboard', 'advanced', 'logs', 'settings'];

interface AppShellProps {
  children: (activeTab: TabId) => ReactNode;
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status = 'Idle' }: { status?: string }) {
  const isActive = status === 'Monitoring';
  const isWarning = status === 'Countdown' || status === 'TriggerPending';

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: isActive
          ? 'rgba(58, 186, 180, 0.15)'
          : isWarning
            ? 'rgba(229, 115, 115, 0.15)'
            : 'rgba(99, 107, 126, 0.15)',
        color: isActive
          ? 'var(--color-accent)'
          : isWarning
            ? 'var(--color-warning)'
            : 'var(--color-text-muted)',
      }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse-dot' : ''}`}
        style={{
          backgroundColor: isActive
            ? 'var(--color-accent)'
            : isWarning
              ? 'var(--color-warning)'
              : 'var(--color-text-muted)',
        }}
      />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Pill Tab Navigation
// ---------------------------------------------------------------------------

function PillTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const { t } = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIdx = TAB_IDS.indexOf(activeTab);
    let nextIdx = currentIdx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % TAB_IDS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + TAB_IDS.length) % TAB_IDS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = TAB_IDS.length - 1;
    }
    if (nextIdx !== currentIdx) {
      onTabChange(TAB_IDS[nextIdx]);
      // Focus the newly active tab button.
      const btn = document.getElementById(`tab-${TAB_IDS[nextIdx]}`);
      btn?.focus();
    }
  };

  return (
    <nav
      className="inline-flex gap-1 rounded-full p-1"
      style={{ backgroundColor: 'var(--color-surface)' }}
      role="tablist"
    >
      {TAB_IDS.map((tabId) => {
        const isActive = tabId === activeTab;
        return (
          <button
            key={tabId}
            id={`tab-${tabId}`}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tabId)}
            onKeyDown={handleKeyDown}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transitionDuration: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {t(`nav.${tabId}`)}
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// App Shell
// ---------------------------------------------------------------------------

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const monitoringStatus = useMonitoringStore((s) => s.status);

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-base)' }}
    >
      {/* Header */}
      <header
        className="flex shrink-0 items-center justify-between px-5 py-3"
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('app.name')}
          </h1>
          <StatusBadge status={monitoringStatus.status} />
        </div>

        <div>
          <PillTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 overflow-y-auto p-5 animate-fade-in" key={activeTab}>
        <div className="mx-auto max-w-3xl">{children(activeTab)}</div>
      </main>
    </div>
  );
}

/**
 * ExclusionList — Manage permanently excluded processes.
 *
 * Users can add process names to always ignore and remove them.
 * Excluded processes are filtered out of the ProcessList.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProcessStore } from '@/stores/processStore';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExclusionList() {
  const { excludedProcesses, addExcluded, removeExcluded } = useProcessStore();
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();

  function handleAdd() {
    const name = inputValue.trim();
    if (name && !excludedProcesses.includes(name)) {
      addExcluded(name);
      setInputValue('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('exclusionList.title')}
      </p>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('exclusionList.placeholder')}
          className="flex-1 rounded-md px-3 py-2 text-sm outline-none transition-colors"
          style={{
            backgroundColor: 'var(--color-base)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: inputValue.trim() ? 'var(--color-accent)' : 'var(--color-surface)',
            color: inputValue.trim() ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
            cursor: inputValue.trim() ? 'pointer' : 'default',
            border: '1px solid transparent',
          }}
        >
          {t('exclusionList.add')}
        </button>
      </div>

      {/* Excluded items */}
      {excludedProcesses.length === 0 ? (
        <div
          className="flex h-full flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-6 text-center"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-bg-base)',
          }}
        >
          {t('exclusionList.emptyState')}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {excludedProcesses.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(229, 115, 115, 0.08)',
                color: 'var(--color-warning)',
                border: '1px solid rgba(229, 115, 115, 0.15)',
              }}
            >
              {name}
              <button
                type="button"
                onClick={() => removeExcluded(name)}
                className="ml-0.5 opacity-60 hover:opacity-100"
                style={{ cursor: 'pointer' }}
                aria-label={t('exclusionList.removeAriaLabel', { name })}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

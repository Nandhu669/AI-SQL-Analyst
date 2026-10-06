/**
 * ShortcutModal.tsx — Keyboard Shortcuts cheatsheet dialog.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react)
 *  - Accessible modal dialog with Esc to close
 */

import { useEffect } from 'react'
import { Command, X } from 'lucide-react'

interface ShortcutModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], description: 'Submit Natural Language prompt or execute SQL Sandbox query' },
  { keys: ['?'], description: 'Toggle this keyboard shortcuts cheatsheet' },
  { keys: ['Esc'], description: 'Dismiss error banners or close modals' },
]

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <Command size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={styles.title}>Keyboard Shortcuts</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div style={styles.body}>
          {SHORTCUTS.map((s, idx) => (
            <div key={idx} style={styles.row}>
              <div style={styles.keys}>
                {s.keys.map((k, i) => (
                  <span key={i}>
                    <kbd>{k}</kbd>
                    {i < s.keys.length - 1 && <span style={styles.plus}>+</span>}
                  </span>
                ))}
              </div>
              <span style={styles.description}>{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: 440,
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-surface-elevated)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 2,
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    fontSize: '0.8rem',
  },
  keys: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  plus: {
    margin: '0 2px',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
  },
  description: {
    color: 'var(--text-secondary)',
    textAlign: 'right',
  },
}

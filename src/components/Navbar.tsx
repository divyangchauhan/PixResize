import type { Theme } from '@/types'

interface NavbarProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2">
        <svg
          className="w-7 h-7 text-[var(--color-accent)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-[var(--color-text)]">
          Pix<span className="text-[var(--color-accent)]">Resize</span>
        </span>
      </div>

      <button
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        className="p-2 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-muted)]"
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </button>
    </header>
  )
}

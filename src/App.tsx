import { useTheme } from '@/hooks/useTheme'
import { Navbar } from '@/components/Navbar'
import { Layout } from '@/components/Layout'

function SidebarPlaceholder() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        Tools
      </p>
      {['Resize', 'Crop', 'Rotate & Flip', 'Filters', 'Watermark', 'Download'].map((item) => (
        <button
          key={item}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--bg3)] transition-colors"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function MainPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-[var(--color-text)]">Drop images here</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Upload coming in PR 2</p>
      </div>
    </div>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar theme={theme} onToggleTheme={toggle} />
      <Layout sidebar={<SidebarPlaceholder />} main={<MainPlaceholder />} />
    </div>
  )
}

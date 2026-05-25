interface LayoutProps {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
  bottom: React.ReactNode
}

export function Layout({ left, center, right, bottom }: LayoutProps) {
  return (
    <div
      className="flex-1 min-h-0"
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 260px',
        gridTemplateRows: '1fr auto',
        overflow: 'hidden',
      }}
    >
      <aside
        style={{
          gridRow: '1 / 3',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {left}
      </aside>

      <main
        style={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg)',
          minHeight: 0,
        }}
      >
        {center}
      </main>

      <aside
        style={{
          gridColumn: '3',
          gridRow: '1 / 3',
          background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {right}
      </aside>

      <div
        style={{
          gridColumn: '2',
          gridRow: '2',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg2)',
        }}
      >
        {bottom}
      </div>
    </div>
  )
}

interface LayoutProps {
  sidebar: React.ReactNode
  main: React.ReactNode
}

export function Layout({ sidebar, main }: LayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-72 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto p-4">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto bg-[var(--color-bg)] p-6">
        {main}
      </main>
    </div>
  )
}

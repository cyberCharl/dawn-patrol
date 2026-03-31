import type { ReactNode } from "react"

type AppShellProps = {
  eyebrow: string
  title: string
  subtitle: string
  meta?: string
  children: ReactNode
}

export function AppShell({
  eyebrow,
  title,
  subtitle,
  meta,
  children,
}: AppShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_30%),linear-gradient(180deg,_rgba(6,11,24,1)_0%,_rgba(9,24,39,1)_45%,_rgba(2,8,18,1)_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_35%,rgba(34,197,94,0.05)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_55%)]" />

      <main className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="space-y-3">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>
          {meta ? (
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {meta}
            </div>
          ) : null}
        </header>

        {children}
      </main>
    </div>
  )
}

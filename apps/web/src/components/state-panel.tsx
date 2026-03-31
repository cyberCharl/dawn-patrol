import type { ReactNode } from "react"

type StatePanelProps = {
  title: string
  body: string
  action?: ReactNode
}

export function StatePanel({ title, body, action }: StatePanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(2,8,18,0.4)] backdrop-blur">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="max-w-lg text-sm leading-6 text-slate-300">{body}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}

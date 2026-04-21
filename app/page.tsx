import Link from "next/link"
import { ArrowRight, Clock3, ExternalLink, LayoutGrid, MousePointerClick, Zap } from "lucide-react"

const patterns = [
  {
    id: "redirect",
    icon: MousePointerClick,
    label: "Pattern A - Redirect",
    title: "Redirect to Edpire",
    description:
      "The simplest integration. Send learners to the Edpire-hosted player with a return URL. Zero front-end work required.",
    pros: ["No front-end setup", "Full Edpire UI (timer, progress, hints)", "Works in < 1 hour"],
    href: "/redirect",
    badge: "Recommended starting point",
    badgeColor: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "pattern-b",
    icon: Zap,
    label: "Pattern B - SDK integration",
    title: "Custom player with SDK",
    description:
      "The embedded SDK flow will be added back in a future update. This demo currently ships only with the redirect pattern.",
    pros: ["Embedded experience", "SDK-managed rendering", "Fits custom in-app journeys"],
    badge: "Coming soon",
    badgeColor: "bg-slate-100 text-slate-600",
    disabled: true,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration patterns</h1>
        <p className="mt-3 max-w-xl text-slate-500">
          Two ways to embed Edpire assessments into your product. The redirect flow is live now, and the
          SDK integration will be added later.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {patterns.map(({ id, icon: Icon, label, title, description, pros, href, badge, badgeColor, disabled }) => {
          const content = (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Icon size={18} className="text-slate-600" />
                </div>
                <span className="text-xs font-medium text-slate-500">{label}</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
              <ul className="mb-5 space-y-1">
                {pros.map((pro) => (
                  <li key={pro} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                    {pro}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor}`}>{badge}</span>
                {disabled ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-400">
                    Soon <Clock3 size={14} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-all group-hover:gap-2">
                    Try it <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </>
          )

          if (disabled) {
            return (
              <div
                key={id}
                aria-disabled="true"
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 opacity-80 shadow-sm"
              >
                {content}
              </div>
            )
          }

          return (
            <Link
              key={id}
              href={href!}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {content}
            </Link>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-2 flex items-center gap-2">
          <LayoutGrid size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Decision guide</span>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Not sure which pattern to use? Here&apos;s a quick rule of thumb:
        </p>
        <div className="space-y-2 text-sm">
          {[
            ["You want to embed assessments in < 1 day", "-> Pattern A"],
            ["You need a custom look and feel inside your app", "-> Pattern B (coming soon)"],
            ["You want an SDK-managed embedded player", "-> Pattern B (coming soon)"],
            ["You need webhook notifications on completion", "-> Both patterns support webhooks"],
          ].map(([condition, recommendation]) => (
            <div key={condition} className="flex gap-3">
              <span className="shrink-0 text-slate-400">{condition}</span>
              <span className="font-medium text-slate-700">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <ExternalLink size={12} />
        Full API reference in your Edpire dashboard under Settings {"->"} Integrations {"->"} API Docs
      </p>
    </div>
  )
}

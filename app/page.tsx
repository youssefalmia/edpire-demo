import Link from "next/link"
import { ArrowRight, ExternalLink, Zap, MousePointerClick, LayoutGrid } from "lucide-react"

const patterns = [
  {
    id: "redirect",
    icon: MousePointerClick,
    label: "Pattern A — Redirect",
    title: "Redirect to Edpire",
    description:
      "The simplest integration. Send learners to the Edpire-hosted player with a return URL. Zero front-end work required.",
    pros: ["No front-end setup", "Full Edpire UI (timer, progress, hints)", "Works in < 1 hour"],
    href: "/redirect",
    badge: "Recommended starting point",
    badgeColor: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "per-question",
    icon: Zap,
    label: "Pattern B — Per-question API",
    title: "Custom player with /check",
    description:
      "Fetch question content and render your own UI. Grade each answer in real-time via the /check endpoint — no answer keys ever leave the server.",
    pros: ["Full UI control", "Immediate per-question feedback", "Works for gamified / Duolingo-style flows"],
    href: "/per-question",
    badge: "Advanced",
    badgeColor: "bg-amber-50 text-amber-700",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration patterns</h1>
        <p className="mt-3 text-slate-500 max-w-xl">
          Two ways to embed Edpire assessments into your product. Pick the one that fits your constraints,
          or combine both.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {patterns.map(({ id, icon: Icon, label, title, description, pros, href, badge, badgeColor }) => (
          <Link
            key={id}
            href={href}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Icon size={18} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">{label}</span>
            </div>
            <h2 className="font-semibold text-lg text-slate-900 mb-2">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{description}</p>
            <ul className="space-y-1 mb-5">
              {pros.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
                {badge}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
                Try it <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Decision guide</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Not sure which pattern to use? Here&apos;s a quick rule of thumb:
        </p>
        <div className="space-y-2 text-sm">
          {[
            ["You want to embed assessments in < 1 day", "→ Pattern A"],
            ["You need a custom look & feel (brand, language, animations)", "→ Pattern B"],
            ["You want gamification (lives, streaks, immediate feedback)", "→ Pattern B"],
            ["You need webhook notifications on completion", "→ Both patterns support webhooks"],
          ].map(([cond, rec]) => (
            <div key={cond} className="flex gap-3">
              <span className="text-slate-400 shrink-0">{cond}</span>
              <span className="font-medium text-slate-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <ExternalLink size={12} />
        Full API reference in your Edpire dashboard under Settings → Integrations → API Docs
      </p>
    </div>
  )
}

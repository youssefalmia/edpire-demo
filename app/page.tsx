import Link from "next/link"
import { ArrowRight, LayoutPanelLeft, MousePointerClick, Sparkles, Trophy } from "lucide-react"

const demos = [
  {
    href: "/library",
    label: "Primary showcase",
    title: "Learner-facing product demo",
    description:
      "See how your platform can present its own evaluation cards, chapter structure, exam objects, and branded result pages on top of Edpire assessments.",
    points: [
      "Local entities wrap Edpire assessments",
      "Result state flows back into your own UI",
      "Friendly, product-style learner experience",
    ],
    icon: Sparkles,
    accent: "bg-sky-100 text-sky-700",
  },
  {
    href: "/builder",
    label: "Admin-style example",
    title: "Builder with Edpire side panel",
    description:
      "Create your own evaluations and exams, edit local metadata on the left, and assign Edpire assessments from the right-side catalog panel.",
    points: [
      "Right-side Edpire catalog panel",
      "Create, delete, reorder, filter",
      "Demonstrates the metadata layer clearly",
    ],
    icon: LayoutPanelLeft,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    href: "/simple-redirect",
    label: "Minimal pattern",
    title: "Simple Redirect",
    description:
      "Keep the smallest viable integration beside the richer product demo so teams can compare the tradeoff directly.",
    points: [
      "List assessments and launch immediately",
      "No custom wrapper model required",
      "Good baseline before layering your own product objects",
    ],
    icon: MousePointerClick,
    accent: "bg-amber-100 text-amber-700",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#e0f2fe,white_44%,#f8fafc)] p-8 shadow-sm">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            Edpire integration patterns
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Show the minimal redirect. Then show what a real product layer looks like.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            This repo now demonstrates both ends of the integration spectrum: a tiny redirect example for
            fast adoption, and a more complete product-demo pattern where your platform owns entities,
            chapters, UI copy, and result presentation while Edpire remains the assessment engine.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {demos.map(({ href, label, title, description, points, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`rounded-2xl p-3 ${accent}`}>
                <Icon size={18} />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {label}
              </span>
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition group-hover:gap-3">
              Open demo <ArrowRight size={15} />
            </div>
          </Link>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-950">What clients should notice</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Edpire owns the assessment runtime, grading, and share-code launch.</li>
            <li>Your product owns the wrapper entities, metadata, sequencing, and learner-facing story.</li>
            <li>Callback verification and webhooks can update your own local view of learner progress.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Important demo note</p>
          <p className="mt-4 text-sm leading-7 text-amber-900">
            The richer pages in this repo use temporary in-memory state so the architecture stays easy to
            read. Production teams would persist wrappers, assignments, and attempt records in their own
            database.
          </p>
        </div>
      </section>
    </div>
  )
}

import Link from "next/link"
import { ArrowRight, BookOpenText, Layers3, ShieldCheck, Trophy } from "lucide-react"
import { bootstrapDemoAssignments, getDemoSnapshot, getLatestAttemptsMap } from "@/lib/demo-store"
import { listAssessments } from "@/lib/edpire"

export const dynamic = "force-dynamic"

export default async function LibraryHomePage() {
  try {
    const assessments = await listAssessments()
    bootstrapDemoAssignments(assessments)
  } catch {}

  const snapshot = getDemoSnapshot()
  const latestAttempts = getLatestAttemptsMap()

  const publishedEvaluations = snapshot.evaluations.filter((item) => item.status === "published")
  const publishedExams = snapshot.exams.filter((item) => item.status === "published")
  const completedCount = Array.from(latestAttempts.values()).filter(
    (attempt) => attempt.status === "completed"
  ).length

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#e0f2fe,white_48%,#f8fafc)] p-8 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            Learner-facing product demo
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Your own cards, chapters, exams, and learner journey. Edpire runs the assessment.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            This is the main showcase. It demonstrates how a platform can present friendly product-owned
            entities on top of Edpire, keep learner-facing copy and structure local, and still rely on
            redirect plus callback for execution.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Published evaluations</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{publishedEvaluations.length}</p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Published exams</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{publishedExams.length}</p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Completed wrappers</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{completedCount}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/library/evaluations"
          className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Layers3 size={20} />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Chapter-based
            </span>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">Evaluations</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Open a chapter-driven evaluation experience. This shows how your own sequencing layer can sit
            above Edpire without using collections at all.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-sky-700 transition group-hover:gap-3">
            Explore evaluations <ArrowRight size={15} />
          </div>
        </Link>

        <Link
          href="/library/exams"
          className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Trophy size={20} />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Different wrapper model
            </span>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">Exams</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Exams intentionally use a different metadata shape. It helps teams see that their platform can
            model multiple learner-facing objects around the same Edpire catalog.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-700 transition group-hover:gap-3">
            Explore exams <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpenText size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-950">What this page is teaching</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>You control the naming, grouping, gating, and learner-facing presentation.</li>
            <li>Each wrapper can point to one Edpire assessment while still carrying local metadata.</li>
            <li>Result state can be reflected back into your own cards after callback and webhook updates.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div className="text-sm leading-6 text-amber-900">
              <p className="font-semibold">Temporary storage</p>
              <p className="mt-2 text-amber-800">
                This demo uses in-memory server state on purpose. In a real product, these wrappers,
                assignments, and attempts would live in your own database.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft, CheckCircle2, ExternalLink, Info, ShieldCheck, XCircle } from "lucide-react"
import { RedirectLauncher } from "@/components/redirect-launcher"
import { getSubmission, listAssessments, type AssessmentSummary } from "@/lib/edpire"

export const dynamic = "force-dynamic"

export default async function SimpleRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{
    submission_id?: string
    score?: string
    max_score?: string
  }>
}) {
  const params = await searchParams
  const submissionId = params.submission_id ?? null
  const verified = submissionId ? await getSubmission(submissionId) : null

  const score = verified?.score ?? (params.score ? Number(params.score) : null)
  const maxScore = verified?.max_score ?? (params.max_score ? Number(params.max_score) : null)
  const percentage =
    verified?.percentage ??
    (score !== null && maxScore ? Math.round((score / maxScore) * 100) : null)
  const passed = verified?.passed ?? (percentage !== null ? percentage >= 60 : null)

  let assessments: AssessmentSummary[] = []
  let error: string | null = null

  try {
    assessments = await listAssessments()
    assessments = assessments.filter((assessment) => assessment.status === "published")
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load assessments"
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="mt-6 flex items-center gap-2">
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            Smallest possible integration
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          Simple Redirect
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This page keeps the integration intentionally thin: list assessments, build a take URL,
          redirect the learner, and then return back to this same page like Edulylo does. It is
          here to show the minimum viable pattern next to the richer product-demo flow.
        </p>
      </div>

      <div className="rounded-3xl border border-sky-200 bg-sky-50/80 p-5">
        <div className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
          <div className="space-y-2 text-sm text-sky-900">
            <p className="font-semibold">What this example proves</p>
            <ul className="space-y-1 text-sky-800">
              <li>Your app does not need to render the assessment itself.</li>
              <li>
                Your org usually launches through a branded tenant like{" "}
                <code>https://your-slug.edpire.com</code>.
              </li>
              <li>You can pass `learner_ref` and return to your own source page.</li>
              <li>You should still verify results by `submission_id` when the learner comes back.</li>
            </ul>
          </div>
        </div>
      </div>

      {submissionId ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="text-emerald-500" size={34} />
              ) : (
                <XCircle className="text-amber-500" size={34} />
              )}
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {passed ? "Back on your platform" : "Returned with a verified result"}
                </p>
                <p className="text-sm text-slate-500">
                  {percentage !== null ? `${percentage}%` : "Pending verification"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Verified score</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {score ?? "-"} / {maxScore ?? "-"}
              </p>
            </div>
          </div>

          {percentage !== null ? (
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Edulylo-style return pattern
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The launch `return_url` now points back to this source page instead of a separate
                callback screen. That matches the Edulylo pattern more closely.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Verification note</p>
                  <p className="mt-1 leading-6 text-emerald-800">
                    This page checks `GET /api/v1/submissions/:id` when `submission_id` is present.
                    URL score params are only used as a fallback for demonstration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simple-redirect"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start another assessment <ExternalLink size={14} />
            </Link>
            <Link
              href="/builder"
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View richer demo
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}. Make sure `EDPIRE_API_KEY` is set.
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No published assessments were found for this org.
        </div>
      ) : (
        <RedirectLauncher assessments={assessments} returnPath="/simple-redirect" />
      )}
    </div>
  )
}

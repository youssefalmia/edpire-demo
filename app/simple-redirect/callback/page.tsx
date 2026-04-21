import Link from "next/link"
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react"
import { getSubmission } from "@/lib/edpire"

interface Props {
  searchParams: Promise<{
    submission_id?: string
    score?: string
    max_score?: string
  }>
}

export default async function SimpleRedirectCallbackPage({ searchParams }: Props) {
  const params = await searchParams
  const submissionId = params.submission_id ?? null
  const verified = submissionId ? await getSubmission(submissionId) : null

  const score = verified?.score ?? (params.score ? Number(params.score) : null)
  const maxScore = verified?.max_score ?? (params.max_score ? Number(params.max_score) : null)
  const percentage =
    verified?.percentage ??
    (score !== null && maxScore ? Math.round((score / maxScore) * 100) : null)
  const passed = verified?.passed ?? (percentage !== null ? percentage >= 60 : null)

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/simple-redirect"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back to Simple Redirect
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">Callback Result</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Even in the minimal redirect pattern, the production-safe move is to treat
          `submission_id` as the source of truth and verify the score server-side.
        </p>
      </div>

      {submissionId ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="text-emerald-500" size={34} />
              ) : (
                <XCircle className="text-rose-500" size={34} />
              )}
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {passed ? "Passed" : "Needs improvement"}
                </p>
                <p className="text-sm text-slate-500">
                  {percentage !== null ? `${percentage}%` : "Pending verification"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Verified score</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {score ?? "—"} / {maxScore ?? "—"}
              </p>
            </div>
          </div>

          {percentage !== null && (
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Payload your app can trust
              </p>
              <pre className="mt-3 overflow-auto text-xs text-slate-700">
                {JSON.stringify(
                  {
                    submission_id: submissionId,
                    verified: Boolean(verified),
                    score,
                    max_score: maxScore,
                    percentage,
                    passed,
                  },
                  null,
                  2
                )}
              </pre>
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
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          No callback data found. Start from the simple redirect page to see the minimal return flow.
        </div>
      )}
    </div>
  )
}

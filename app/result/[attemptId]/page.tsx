import Link from "next/link"
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck, Webhook, XCircle } from "lucide-react"
import { getAttemptById } from "@/lib/demo-store"
import { resolveAttemptResult } from "@/lib/demo-runtime"

interface Props {
  params: Promise<{ attemptId: string }>
  searchParams: Promise<{ submission_id?: string; error?: string }>
}

export const dynamic = "force-dynamic"

function getBackLink(entityType: "evaluation" | "exam") {
  return entityType === "evaluation" ? "/library/evaluations" : "/library/exams"
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { attemptId } = await params
  const { submission_id: submissionId, error } = await searchParams

  if (submissionId) {
    await resolveAttemptResult(attemptId, submissionId)
  }

  const attempt = getAttemptById(attemptId)

  if (!attempt) {
    return (
      <div className="space-y-6">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back to library
        </Link>
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          This attempt could not be found. The demo store resets when the server restarts.
        </div>
      </div>
    )
  }

  const backHref = getBackLink(attempt.entityType)
  const percentage = attempt.percentage
  const passed = attempt.passed

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back to {attempt.entityType === "evaluation" ? "evaluations" : "exams"}
        </Link>
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Open builder <ExternalLink size={14} />
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        <div
          className={`p-8 ${
            passed === true
              ? "bg-[radial-gradient(circle_at_top_left,#dcfce7,white_45%,#f8fafc)]"
              : passed === false
              ? "bg-[radial-gradient(circle_at_top_left,#fef3c7,white_45%,#f8fafc)]"
              : "bg-[radial-gradient(circle_at_top_left,#e0f2fe,white_45%,#f8fafc)]"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Standalone result page
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                {attempt.assessmentTitle}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This page is fully owned by your platform. Edpire handled the assessment run, while your
                product owns the result presentation, the navigation, and the local wrapper state.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/85 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                {passed === true ? (
                  <CheckCircle2 className="text-emerald-500" size={34} />
                ) : passed === false ? (
                  <XCircle className="text-amber-500" size={34} />
                ) : (
                  <ShieldCheck className="text-sky-500" size={34} />
                )}
                <div>
                  <p className="text-sm text-slate-500">Latest state</p>
                  <p className="text-xl font-semibold text-slate-950">
                    {passed === true ? "Passed" : passed === false ? "Failed" : "Pending"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                {percentage !== null ? `${percentage}%` : "—"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {attempt.score ?? "—"} / {attempt.maxScore ?? "—"} points
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {percentage !== null ? (
              <div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      passed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">Yes</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Passed / failed</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {passed ? "Passed" : "Failed"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last attempted</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {new Date(attempt.lastAttemptedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                {error === "missing_take_base"
                  ? "The take URL is not configured yet. Set NEXT_PUBLIC_EDPIRE_ORG_SLUG or NEXT_PUBLIC_EDPIRE_TENANT_ORIGIN and try again."
                  : "No verified result is available yet. If you landed here without a submission_id, the webhook may still update this attempt later."}
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Why this matters
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Your callback page can be completely branded and product-specific.</li>
                <li>Your wrapper entity now shows updated learner state back in the library UI.</li>
                <li>The source of truth is `submission_id`, not score values from the URL.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-950">Verified by submission ID</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    When `submission_id` is present, this page fetches the full submission from Edpire and
                    updates the local wrapper state from verified data.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl border p-5 ${
                attempt.updatedViaWebhook
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-sky-200 bg-sky-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Webhook
                  size={18}
                  className={`mt-0.5 shrink-0 ${
                    attempt.updatedViaWebhook ? "text-emerald-700" : "text-sky-700"
                  }`}
                />
                <div>
                  <p className="font-semibold text-slate-950">
                    {attempt.updatedViaWebhook ? "Webhook updated this attempt" : "Webhook-ready example"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The demo wires a real `submission.graded` endpoint. Live local delivery still needs a
                    public URL or tunnel, so the callback flow remains usable on its own.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Attempt payload
              </p>
              <pre className="mt-3 overflow-auto text-xs text-slate-700">
                {JSON.stringify(
                  {
                    attemptId: attempt.id,
                    submissionId: attempt.submissionId,
                    entityType: attempt.entityType,
                    entityId: attempt.entityId,
                    score: attempt.score,
                    maxScore: attempt.maxScore,
                    percentage: attempt.percentage,
                    passed: attempt.passed,
                    updatedViaWebhook: attempt.updatedViaWebhook,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

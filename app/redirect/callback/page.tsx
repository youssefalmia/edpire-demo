import Link from "next/link"
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react"

interface Props {
  searchParams: Promise<{
    submission_id?: string
    score?: string
    max_score?: string
  }>
}

export default async function CallbackPage({ searchParams }: Props) {
  const params = await searchParams
  const score = params.score ? Number(params.score) : null
  const maxScore = params.max_score ? Number(params.max_score) : null
  const submissionId = params.submission_id ?? null

  const pct = score !== null && maxScore ? Math.round((score / maxScore) * 100) : null
  const passed = pct !== null ? pct >= 60 : null

  return (
    <div className="space-y-8">
      <div>
        <Link href="/redirect" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back to assessments
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Result</h1>
      </div>

      {submissionId ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6">
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle2 size={32} className="text-emerald-500" />
            ) : (
              <XCircle size={32} className="text-red-500" />
            )}
            <div>
              <p className="font-semibold text-lg">{passed ? "Passed" : "Needs improvement"}</p>
              {pct !== null && (
                <p className="text-slate-500 text-sm">{pct}% — {score} / {maxScore} points</p>
              )}
            </div>
          </div>

          {pct !== null && (
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-red-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">What your app received</p>
            <pre className="text-xs text-slate-700 overflow-auto">
              {JSON.stringify({ submission_id: submissionId, score, max_score: maxScore }, null, 2)}
            </pre>
          </div>

          <p className="text-sm text-slate-500">
            Use the <code className="bg-slate-100 px-1 rounded text-xs">submission_id</code> to fetch the
            full submission details via <code className="bg-slate-100 px-1 rounded text-xs">GET /api/v1/submissions/:id</code>.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No result data found. Try starting an assessment from the{" "}
          <Link href="/redirect" className="underline">redirect page</Link>.
        </div>
      )}
    </div>
  )
}

import { listAssessments } from "@/lib/edpire"
import type { Assessment } from "@/lib/edpire"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PerQuestionIndexPage() {
  let assessments: Assessment[] = []
  let error: string | null = null

  try {
    assessments = await listAssessments()
    assessments = assessments.filter((a) => a.status === "published")
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load assessments"
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Pattern B</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Custom player with /check</h1>
        <p className="mt-2 text-slate-500">
          Select an assessment to see the per-question flow with real-time grading.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-medium">How it works</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
            <li>Fetch the assessment via <code className="bg-blue-100 px-1 rounded">GET /api/v1/assessments/:id</code></li>
            <li>Render each question with your own UI (this demo uses a minimal built-in renderer)</li>
            <li>On submit, call <code className="bg-blue-100 px-1 rounded">POST /api/v1/assessments/:id/check</code></li>
            <li>Show feedback immediately — answer keys never leave the server</li>
          </ol>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : assessments.length === 0 ? (
        <p className="text-slate-500 text-sm">No published assessments found.</p>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <Link
              key={a.id}
              href={`/per-question/${a.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div>
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{a.max_score} pts · {a.exercises.length} exercise{a.exercises.length !== 1 ? "s" : ""}</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

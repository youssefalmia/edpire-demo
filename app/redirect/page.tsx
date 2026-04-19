import { listAssessments } from "@/lib/edpire"
import type { Assessment } from "@/lib/edpire"
import { RedirectLauncher } from "@/components/redirect-launcher"
import { ArrowLeft, Info } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function RedirectPage() {
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
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">Pattern A</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Redirect to Edpire</h1>
        <p className="mt-2 text-slate-500">
          Click &ldquo;Start&rdquo; to redirect to the Edpire-hosted player. After completion, you&apos;ll be
          sent back here with the result.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-medium">How it works</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
            <li>Your app constructs a take URL with a <code className="bg-blue-100 px-1 rounded">return_url</code></li>
            <li>Learner completes the assessment on Edpire</li>
            <li>Edpire redirects back to your <code className="bg-blue-100 px-1 rounded">return_url</code> with score appended</li>
            <li>Your app reads <code className="bg-blue-100 px-1 rounded">?score=&max_score=&submission_id=</code></li>
          </ol>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error} — make sure your <code className="bg-red-100 px-1 rounded">EDPIRE_API_KEY</code> is set.
        </div>
      ) : assessments.length === 0 ? (
        <p className="text-slate-500 text-sm">No published assessments found in your org.</p>
      ) : (
        <RedirectLauncher assessments={assessments} />
      )}
    </div>
  )
}

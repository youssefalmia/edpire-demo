import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import { RedirectLauncher } from "@/components/redirect-launcher"
import { listAssessments, type AssessmentSummary } from "@/lib/edpire"

export const dynamic = "force-dynamic"

export default async function SimpleRedirectPage() {
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
          redirect the learner, and handle the return. It is here to show the minimum viable
          pattern next to the richer product-demo flow.
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
              <li>You can pass `learner_ref` and `return_url` from your own platform.</li>
              <li>You should still verify results by `submission_id` on return.</li>
            </ul>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}. Make sure `EDPIRE_API_KEY` is set.
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No published assessments were found for this org.
        </div>
      ) : (
        <RedirectLauncher assessments={assessments} callbackPath="/simple-redirect/callback" />
      )}
    </div>
  )
}

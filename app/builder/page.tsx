import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DemoBuilder } from "@/components/demo-builder"
import {
  bootstrapDemoAssignments,
  getAssessmentUsageMap,
  getDemoSnapshot,
  replaceAssessmentResults,
} from "@/lib/demo-store"
import { getAssessmentResults, listAssessments, type AssessmentSummary } from "@/lib/edpire"

export const dynamic = "force-dynamic"

export default async function BuilderPage() {
  let assessments: AssessmentSummary[] = []
  let assessmentError: string | null = null
  const resultsErrors: Record<string, string> = {}

  try {
    assessments = await listAssessments()
    bootstrapDemoAssignments(assessments)
  } catch (err) {
    assessmentError = err instanceof Error ? err.message : "Failed to load Edpire assessments"
  }

  let snapshot = getDemoSnapshot()
  const assignedAssessmentIds = Array.from(
    new Set(snapshot.evaluations.map((item) => item.assessmentId).filter((item): item is string => Boolean(item)))
  )

  for (const assessmentId of assignedAssessmentIds) {
    try {
      const results = await getAssessmentResults(assessmentId)
      replaceAssessmentResults(assessmentId, results)
    } catch (err) {
      resultsErrors[assessmentId] =
        err instanceof Error ? err.message : "Failed to sync Edpire results for this assessment"
    }
  }

  snapshot = getDemoSnapshot()
  const usageByAssessmentId = Object.fromEntries(getAssessmentUsageMap().entries())

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <DemoBuilder
        chapters={snapshot.chapters}
        evaluations={snapshot.evaluations}
        assessments={assessments}
        usageByAssessmentId={usageByAssessmentId}
        assessmentError={assessmentError}
        resultsErrorByAssessmentId={resultsErrors}
        resultsSnapshots={snapshot.assessmentResults}
      />
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DemoBuilder } from "@/components/demo-builder"
import { bootstrapDemoAssignments, getAssessmentUsageMap, getDemoSnapshot } from "@/lib/demo-store"
import { listAssessments, type AssessmentSummary } from "@/lib/edpire"

export const dynamic = "force-dynamic"

export default async function BuilderPage() {
  let assessments: AssessmentSummary[] = []
  let assessmentError: string | null = null

  try {
    assessments = await listAssessments()
    bootstrapDemoAssignments(assessments)
  } catch (err) {
    assessmentError = err instanceof Error ? err.message : "Failed to load Edpire assessments"
  }

  const snapshot = getDemoSnapshot()
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
        exams={snapshot.exams}
        assessments={assessments}
        usageByAssessmentId={usageByAssessmentId}
        assessmentError={assessmentError}
      />
    </div>
  )
}

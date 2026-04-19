import { getAssessment } from "@/lib/edpire"
import { flattenAssessment } from "@/lib/edpire"
import { PerQuestionPlayer } from "@/components/per-question-player"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PerQuestionPlayerPage({ params }: Props) {
  const { id } = await params

  let assessment
  try {
    assessment = await getAssessment(id)
  } catch {
    notFound()
  }

  const questions = flattenAssessment(assessment)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/per-question" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft size={14} /> Back to assessments
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
        {assessment.description && (
          <p className="mt-1 text-slate-500">{assessment.description}</p>
        )}
      </div>
      <PerQuestionPlayer
        assessmentId={assessment.id}
        questions={questions}
        totalPoints={assessment.max_score}
      />
    </div>
  )
}

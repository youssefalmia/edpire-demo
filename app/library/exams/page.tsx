import Link from "next/link"
import { ArrowLeft, CheckCircle2, Trophy } from "lucide-react"
import { LibraryEntityCard } from "@/components/library-entity-card"
import { bootstrapDemoAssignments, getDemoSnapshot, getLatestAttemptsMap } from "@/lib/demo-store"
import { listAssessments } from "@/lib/edpire"
import { resolveAttemptResult } from "@/lib/demo-runtime"

export const dynamic = "force-dynamic"

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ submission_id?: string; attempt_id?: string }>
}) {
  const { submission_id: submissionId, attempt_id: attemptId } = await searchParams

  try {
    const assessments = await listAssessments()
    bootstrapDemoAssignments(assessments)
  } catch {}

  let syncedAttemptId: string | null = null
  if (submissionId && attemptId) {
    const updated = await resolveAttemptResult(attemptId, submissionId)
    if (updated?.status === "completed") {
      syncedAttemptId = updated.id
    }
  }

  const snapshot = getDemoSnapshot()
  const latestAttempts = getLatestAttemptsMap()
  const exams = snapshot.exams.filter((item) => item.status === "published")

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} /> Back to library
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#ede9fe,white_44%,#f8fafc)] p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-700">Exams</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              A second wrapper type with its own rules
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Exams are deliberately shaped differently from evaluations. This is the part many product
              teams care about: local business objects can vary, while the Edpire assessment underneath can
              remain the same.
            </p>
          </div>
        </div>
      </section>

      {syncedAttemptId ? (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
              <div className="text-sm leading-6 text-emerald-900">
                <p className="font-semibold">Back on your platform</p>
                <p className="mt-1 text-emerald-800">
                  This page processed the Edpire `submission_id` on return, and the exam card now
                  shows the updated completion state.
                </p>
              </div>
            </div>
            <Link
              href={`/result/${syncedAttemptId}`}
              className="inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Open result page
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        {exams.map((exam) => (
          <LibraryEntityCard
            key={exam.id}
            entityType="exam"
            entityId={exam.id}
            title={exam.title}
            description={exam.description}
            isFree={exam.isFree}
            assessmentAssigned={Boolean(exam.assessmentId)}
            assessmentTitle={exam.assessmentTitle}
            latestAttempt={latestAttempts.get(`exam:${exam.id}`) ?? null}
            difficulty={exam.difficulty}
          />
        ))}
      </div>
    </div>
  )
}

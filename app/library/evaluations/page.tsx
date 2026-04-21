import Link from "next/link"
import { ArrowLeft, CheckCircle2, Layers3 } from "lucide-react"
import { LibraryEntityCard } from "@/components/library-entity-card"
import { bootstrapDemoAssignments, getDemoSnapshot, getLatestAttemptsMap } from "@/lib/demo-store"
import { listAssessments } from "@/lib/edpire"
import { resolveAttemptResult } from "@/lib/demo-runtime"

export const dynamic = "force-dynamic"

export default async function EvaluationsPage({
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

  const publishedEvaluations = snapshot.evaluations
    .filter((item) => item.status === "published")
    .sort((left, right) => left.sortOrder - right.sortOrder)

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

      <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#e0f2fe,white_46%,#f8fafc)] p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Layers3 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
              Evaluations
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Local chapters on top of Edpire assessments
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Chapters here are owned entirely by your platform. The cards below are your own evaluation
              wrappers, reordered and grouped however you want, while Edpire still powers the actual
              assessment run.
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
                  This page processed the Edpire `submission_id` on return, and the evaluation card
                  below now reflects the completed state.
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

      <div className="space-y-8">
        {snapshot.chapters.map((chapter) => {
          const items = publishedEvaluations.filter((item) => item.chapterId === chapter.id)
          if (items.length === 0) return null

          return (
            <section key={chapter.id} className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">{chapter.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{chapter.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {items.length} wrapper{items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {items.map((item) => (
                  <LibraryEntityCard
                    key={item.id}
                    entityId={item.id}
                    title={item.title}
                    description={item.description}
                    isFree={item.isFree}
                    assessmentAssigned={Boolean(item.assessmentId)}
                    assessmentTitle={item.assessmentTitle}
                    latestAttempt={latestAttempts.get(`evaluation:${item.id}`) ?? null}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

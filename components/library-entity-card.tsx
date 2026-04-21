import Link from "next/link"
import { Clock3, Lock, Play, ShieldCheck, Sparkles } from "lucide-react"
import type { AttemptRecord } from "@/lib/demo-store"
import { startEntityAttemptAction } from "@/lib/demo-actions"

interface Props {
  entityId: string
  title: string
  description: string
  isFree: boolean
  assessmentAssigned: boolean
  assessmentTitle: string | null
  latestAttempt: AttemptRecord | null
}

export function LibraryEntityCard({
  entityId,
  title,
  description,
  isFree,
  assessmentAssigned,
  assessmentTitle,
  latestAttempt,
}: Props) {
  const action = startEntityAttemptAction
  const completed = latestAttempt?.status === "completed"

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Evaluation</p>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <Sparkles className="text-sky-500" size={18} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isFree ? "Free access" : "Premium gate"}
        </span>
        {assessmentAssigned ? (
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            Edpire linked
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Awaiting assignment
          </span>
        )}
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Latest learner state
        </p>

        {completed ? (
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                className={latestAttempt?.passed ? "text-emerald-500" : "text-amber-500"}
              />
              <span>{latestAttempt?.passed ? "Completed and passed" : "Completed, review needed"}</span>
            </div>
            <p>
              Latest score:{" "}
              <span className="font-semibold text-slate-900">
                {latestAttempt?.score} / {latestAttempt?.maxScore}
              </span>
            </p>
            <p>
              Passed/Failed:{" "}
              <span className="font-semibold text-slate-900">
                {latestAttempt?.passed ? "Passed" : "Failed"}
              </span>
            </p>
            <p>
              Last attempted:{" "}
              <span className="font-semibold text-slate-900">
                {new Date(latestAttempt.lastAttemptedAt).toLocaleString()}
              </span>
            </p>
            <Link
              href={`/result/${latestAttempt.id}`}
              className="inline-flex text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Open result page
            </Link>
          </div>
        ) : latestAttempt ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Clock3 size={15} className="text-amber-500" />
            Attempt started. Waiting for callback or webhook update.
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            No learner activity yet. Start from this card to demonstrate the redirect flow and local
            wrapper update.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-3xl bg-[linear-gradient(135deg,#f8fafc,white)] p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">
          {assessmentTitle ?? "No Edpire assessment assigned yet"}
        </p>
        <p className="mt-2 leading-6">
          This card is your app-owned wrapper. The Edpire assessment stays the execution engine underneath.
        </p>
      </div>

      <form action={action} className="mt-6">
        <input type="hidden" name="entityType" value="evaluation" />
        <input type="hidden" name="entityId" value={entityId} />
        <button
          type="submit"
          disabled={!assessmentAssigned}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
            assessmentAssigned
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {assessmentAssigned ? <Play size={15} /> : <Lock size={15} />}
          {assessmentAssigned ? "Start assessment" : "Assign in builder to activate"}
        </button>
      </form>
    </article>
  )
}

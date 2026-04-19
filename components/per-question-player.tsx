"use client"

import { useState, useRef } from "react"
import { QuestionRenderer } from "./question-renderer"
import type { AnswerMap } from "./question-renderer"
import type { FlatQuestion, RuntimeAnswer, CheckResult } from "@/lib/edpire"
import { CheckCircle2, XCircle, ChevronRight, Loader2, Trophy } from "lucide-react"

interface Props {
  assessmentId: string
  questions: FlatQuestion[]
  totalPoints: number
}

type Phase = "answering" | "feedback" | "done"

interface QuestionState {
  answers: AnswerMap
  result: CheckResult | null
  feedback: Record<string, { correct?: boolean; message?: string }>
}

// stable session id for rate-limit tracking
const SESSION_ID = typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)

export function PerQuestionPlayer({ assessmentId, questions, totalPoints }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("answering")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [results, setResults] = useState<(CheckResult | null)[]>([])

  const answerMapsRef = useRef<Map<number, AnswerMap>>(new Map())
  const [currentAnswers, setCurrentAnswers] = useState<AnswerMap>(new Map())
  const [currentFeedback, setCurrentFeedback] = useState<Record<string, { correct?: boolean; message?: string }>>({})
  const [currentResult, setCurrentResult] = useState<CheckResult | null>(null)

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  function handleAnswer(answer: RuntimeAnswer) {
    setCurrentAnswers((prev) => {
      const next = new Map(prev)
      next.set(answer.nodeId, answer)
      return next
    })
  }

  async function handleCheck() {
    if (currentAnswers.size === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/check/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: current.exerciseId,
          question_id: current.questionId,
          answers: Array.from(currentAnswers.values()),
          learner_ref: "demo-user",
          session_id: SESSION_ID,
          include_correct_answers: true,
        }),
      })

      const json = await res.json() as { data?: CheckResult; error?: string }
      if (!res.ok || !json.data) throw new Error(json.error ?? "Check failed")

      const result = json.data
      setCurrentResult(result)
      setTotalScore((s) => s + result.score)
      setResults((prev) => {
        const next = [...prev]
        next[currentIndex] = result
        return next
      })

      // Build simple feedback map — one entry per answer node
      const feedbackMap: Record<string, { correct?: boolean; message?: string }> = {}
      for (const nodeId of currentAnswers.keys()) {
        feedbackMap[nodeId] = {
          correct: result.correct,
          message: result.correct ? "Correct!" : "Not quite.",
        }
      }
      setCurrentFeedback(feedbackMap)
      setPhase("feedback")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (isLast) {
      setPhase("done")
      return
    }
    setCurrentIndex((i) => i + 1)
    setCurrentAnswers(new Map())
    setCurrentFeedback({})
    setCurrentResult(null)
    setPhase("answering")
  }

  // ── Done screen ───────────────────────────────────────────────────────────

  if (phase === "done" || (currentIndex >= questions.length && questions.length > 0)) {
    const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 text-center">
        <Trophy size={40} className="mx-auto text-amber-400" />
        <div>
          <p className="text-2xl font-bold">{pct}%</p>
          <p className="text-slate-500 mt-1">{totalScore} / {totalPoints} points</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${pct >= 60 ? "bg-emerald-500" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {results.map((r, i) =>
            r ? (
              r.correct ? (
                <CheckCircle2 key={i} size={20} className="text-emerald-500" />
              ) : (
                <XCircle key={i} size={20} className="text-red-400" />
              )
            ) : null,
          )}
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0)
            setPhase("answering")
            setTotalScore(0)
            setResults([])
            setCurrentAnswers(new Map())
            setCurrentFeedback({})
            setCurrentResult(null)
          }}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{current.points} pt{current.points !== 1 ? "s" : ""}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <QuestionRenderer
          contentAst={current.contentAst}
          answers={currentAnswers}
          onAnswer={handleAnswer}
          disabled={phase === "feedback"}
          feedback={currentFeedback}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Result banner */}
        {phase === "feedback" && currentResult && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${currentResult.correct ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
            {currentResult.correct ? (
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-500 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${currentResult.correct ? "text-emerald-800" : "text-red-800"}`}>
                {currentResult.correct ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-xs text-slate-500">{currentResult.score} / {currentResult.max_score} points</p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        {phase === "answering" ? (
          <button
            onClick={handleCheck}
            disabled={loading || currentAnswers.size === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Check answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            {isLast ? "See results" : "Next question"}
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

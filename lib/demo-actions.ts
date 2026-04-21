"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { AssessmentSummary } from "@/lib/edpire"
import { buildEdpireTakeUrl, getTakeUrlReadiness } from "@/lib/take-url"
import {
  DEMO_LEARNER_ID,
  assignAssessment,
  createAttempt,
  createEntityFromAssessment,
  createEvaluation,
  deleteEntity,
  moveEvaluation,
  saveEvaluation,
} from "@/lib/demo-store"

function refreshDemoPaths() {
  revalidatePath("/")
  revalidatePath("/builder")
  revalidatePath("/library")
  revalidatePath("/library/evaluations")
}

export async function createEvaluationAction() {
  createEvaluation()
  refreshDemoPaths()
}

export async function saveEvaluationAction(formData: FormData) {
  saveEvaluation({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "draft") as "draft" | "published" | "archived",
    isFree: formData.get("isFree") === "true",
    chapterId: String(formData.get("chapterId") ?? ""),
  })

  refreshDemoPaths()
}

export async function deleteEntityAction(formData: FormData) {
  deleteEntity(String(formData.get("id") ?? ""))
  refreshDemoPaths()
}

export async function moveEvaluationAction(formData: FormData) {
  moveEvaluation(
    String(formData.get("id") ?? ""),
    String(formData.get("direction") ?? "up") as "up" | "down"
  )

  refreshDemoPaths()
}

function parseAssessmentFromFormData(formData: FormData): AssessmentSummary {
  return {
    id: String(formData.get("assessmentId") ?? ""),
    title: String(formData.get("assessmentTitle") ?? ""),
    description: null,
    type: "assessment",
    status: String(formData.get("assessmentStatus") ?? "published"),
    share_code: String(formData.get("assessmentShareCode") ?? ""),
    max_score: Number(formData.get("assessmentMaxScore") ?? 0),
    exercise_count: 0,
  }
}

export async function assignAssessmentAction(formData: FormData) {
  assignAssessment({
    entityId: String(formData.get("entityId") ?? ""),
    assessment: parseAssessmentFromFormData(formData),
  })

  refreshDemoPaths()
}

export async function createEvaluationFromAssessmentAction(formData: FormData) {
  createEntityFromAssessment(parseAssessmentFromFormData(formData))
  refreshDemoPaths()
}

export async function startEntityAttemptAction(formData: FormData) {
  const entityId = String(formData.get("entityId") ?? "")
  const attempt = createAttempt({
    entityId,
    learnerRef: DEMO_LEARNER_ID,
  })

  if (!attempt) {
    redirect("/library/evaluations")
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const { ready } = getTakeUrlReadiness()

  if (!ready) {
    redirect(`/result/${attempt.id}?error=missing_take_base`)
  }

  const libraryBackUrl = `${appUrl}/library/evaluations`
  const takeUrl = buildEdpireTakeUrl({
    shareCode: attempt.shareCode,
    learnerRef: DEMO_LEARNER_ID,
    returnUrl: `${libraryBackUrl}?attempt_id=${attempt.id}`,
    backUrl: libraryBackUrl,
    backLabel: "Back to your platform",
    reportLabel: "Return to platform",
  })

  redirect(takeUrl)
}

import "server-only"

import { randomUUID } from "crypto"
import type { AssessmentSummary, SubmissionResult } from "@/lib/edpire"

export const DEMO_LEARNER_ID = "learner-demo-01"

export type EntityStatus = "draft" | "published" | "archived"
export type Difficulty = "easy" | "medium" | "hard"
export type EntityType = "evaluation" | "exam"

export interface Chapter {
  id: string
  title: string
  description: string
}

export interface EvaluationEntity {
  id: string
  title: string
  description: string
  status: EntityStatus
  isFree: boolean
  chapterId: string
  sortOrder: number
  assessmentId: string | null
  assessmentTitle: string | null
  shareCode: string | null
}

export interface ExamEntity {
  id: string
  title: string
  description: string
  status: EntityStatus
  isFree: boolean
  difficulty: Difficulty
  assessmentId: string | null
  assessmentTitle: string | null
  shareCode: string | null
}

export interface AttemptRecord {
  id: string
  entityType: EntityType
  entityId: string
  learnerRef: string
  assessmentId: string
  assessmentTitle: string
  shareCode: string
  submissionId: string | null
  status: "pending" | "completed"
  score: number | null
  maxScore: number | null
  percentage: number | null
  passed: boolean | null
  lastAttemptedAt: string
  updatedViaWebhook: boolean
}

interface DemoState {
  chapters: Chapter[]
  evaluations: EvaluationEntity[]
  exams: ExamEntity[]
  attempts: AttemptRecord[]
  autoSeededFromCatalog: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var __edpireDemoState: DemoState | undefined
}

function createInitialState(): DemoState {
  return {
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter 1",
        description: "Foundational work. Reorder evaluations here to mirror your own curriculum structure.",
      },
      {
        id: "chapter-2",
        title: "Chapter 2",
        description: "A second local grouping layer owned by your product, not by Edpire.",
      },
      {
        id: "chapter-3",
        title: "Chapter 3",
        description: "Useful when your team wants product-specific sequencing on top of assessments.",
      },
    ],
    evaluations: [
      {
        id: "evaluation-1",
        title: "Reading Warm-up",
        description: "A lightweight evaluation card with business-facing copy and local placement rules.",
        status: "published",
        isFree: true,
        chapterId: "chapter-1",
        sortOrder: 0,
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
      {
        id: "evaluation-2",
        title: "Comprehension Checkpoint",
        description: "Same Edpire assessment could be reused in another wrapper if your product needs it.",
        status: "published",
        isFree: false,
        chapterId: "chapter-1",
        sortOrder: 1,
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
      {
        id: "evaluation-3",
        title: "Chapter 2 Practice",
        description: "A published evaluation in a different chapter to demonstrate ordering and grouping.",
        status: "published",
        isFree: false,
        chapterId: "chapter-2",
        sortOrder: 0,
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
      {
        id: "evaluation-4",
        title: "Archived Drill",
        description: "Archived entities remain part of your app model even though learners do not see them.",
        status: "archived",
        isFree: false,
        chapterId: "chapter-3",
        sortOrder: 0,
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        description: "Exams intentionally have a different shape to show that your wrappers can vary by use case.",
        status: "published",
        isFree: false,
        difficulty: "medium",
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
      {
        id: "exam-2",
        title: "Final Exam",
        description: "High-stakes wrapper with its own UI language and metadata rules.",
        status: "draft",
        isFree: false,
        difficulty: "hard",
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
      {
        id: "exam-3",
        title: "Open Practice Exam",
        description: "Free exam wrapper showing that local access logic can differ from the underlying assessment.",
        status: "published",
        isFree: true,
        difficulty: "easy",
        assessmentId: null,
        assessmentTitle: null,
        shareCode: null,
      },
    ],
    attempts: [],
    autoSeededFromCatalog: false,
  }
}

function getState(): DemoState {
  if (!global.__edpireDemoState) {
    global.__edpireDemoState = createInitialState()
  }

  return global.__edpireDemoState
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getDemoSnapshot() {
  const state = getState()
  return clone({
    chapters: state.chapters,
    evaluations: state.evaluations,
    exams: state.exams,
    attempts: state.attempts,
  })
}

function assignAssessmentToEvaluation(
  evaluation: EvaluationEntity,
  assessment: AssessmentSummary | null
) {
  evaluation.assessmentId = assessment?.id ?? null
  evaluation.assessmentTitle = assessment?.title ?? null
  evaluation.shareCode = assessment?.share_code ?? null
}

function assignAssessmentToExam(exam: ExamEntity, assessment: AssessmentSummary | null) {
  exam.assessmentId = assessment?.id ?? null
  exam.assessmentTitle = assessment?.title ?? null
  exam.shareCode = assessment?.share_code ?? null
}

// Seed a few wrappers from the live Edpire catalog so the learner-facing demo
// works immediately once an API key is configured.
export function bootstrapDemoAssignments(assessments: AssessmentSummary[]) {
  const state = getState()
  if (state.autoSeededFromCatalog || assessments.length === 0) return

  const published = assessments.filter((assessment) => assessment.status === "published")
  if (published.length === 0) return

  if (!state.evaluations.some((item) => item.assessmentId)) {
    state.evaluations.slice(0, 3).forEach((evaluation, index) => {
      assignAssessmentToEvaluation(evaluation, published[index] ?? null)
    })
  }

  if (!state.exams.some((item) => item.assessmentId)) {
    state.exams
      .filter((exam) => exam.status === "published")
      .slice(0, 2)
      .forEach((exam, index) => {
        assignAssessmentToExam(exam, published[index + 1] ?? published[index] ?? null)
      })
  }

  state.autoSeededFromCatalog = true
}

export function createEvaluation() {
  const state = getState()
  const chapterId = state.chapters[0]?.id ?? "chapter-1"
  const nextOrder =
    state.evaluations.filter((item) => item.chapterId === chapterId).length

  state.evaluations.unshift({
    id: randomUUID(),
    title: "New Evaluation",
    description: "Add your own business rules, copy, and learner-facing metadata here.",
    status: "draft",
    isFree: false,
    chapterId,
    sortOrder: nextOrder,
    assessmentId: null,
    assessmentTitle: null,
    shareCode: null,
  })
}

export function createExam() {
  const state = getState()
  state.exams.unshift({
    id: randomUUID(),
    title: "New Exam",
    description: "A separate wrapper type with its own metadata shape and visual treatment.",
    status: "draft",
    isFree: false,
    difficulty: "medium",
    assessmentId: null,
    assessmentTitle: null,
    shareCode: null,
  })
}

export function createEntityFromAssessment(entityType: EntityType, assessment: AssessmentSummary) {
  if (entityType === "evaluation") {
    createEvaluation()
    const state = getState()
    const latest = state.evaluations[0]
    latest.title = assessment.title
    latest.description = "Created directly from the Edpire catalog in the builder panel."
    assignAssessmentToEvaluation(latest, assessment)
    latest.status = "published"
    return
  }

  createExam()
  const state = getState()
  const latest = state.exams[0]
  latest.title = assessment.title
  latest.description = "Created directly from the Edpire catalog in the builder panel."
  latest.difficulty = "medium"
  assignAssessmentToExam(latest, assessment)
  latest.status = "published"
}

export function saveEvaluation(input: {
  id: string
  title: string
  description: string
  status: EntityStatus
  isFree: boolean
  chapterId: string
}) {
  const state = getState()
  const current = state.evaluations.find((item) => item.id === input.id)
  if (!current) return

  const previousChapterId = current.chapterId
  current.title = input.title
  current.description = input.description
  current.status = input.status
  current.isFree = input.isFree
  current.chapterId = input.chapterId

  if (previousChapterId !== input.chapterId) {
    const nextOrder =
      state.evaluations.filter(
        (item) => item.chapterId === input.chapterId && item.id !== current.id
      ).length
    current.sortOrder = nextOrder
    normalizeChapterOrder(previousChapterId)
    normalizeChapterOrder(input.chapterId)
  }
}

export function saveExam(input: {
  id: string
  title: string
  description: string
  status: EntityStatus
  isFree: boolean
  difficulty: Difficulty
}) {
  const state = getState()
  const current = state.exams.find((item) => item.id === input.id)
  if (!current) return

  current.title = input.title
  current.description = input.description
  current.status = input.status
  current.isFree = input.isFree
  current.difficulty = input.difficulty
}

export function deleteEntity(entityType: EntityType, id: string) {
  const state = getState()
  if (entityType === "evaluation") {
    const evaluation = state.evaluations.find((item) => item.id === id)
    state.evaluations = state.evaluations.filter((item) => item.id !== id)
    state.attempts = state.attempts.filter(
      (attempt) => !(attempt.entityType === "evaluation" && attempt.entityId === id)
    )
    if (evaluation) normalizeChapterOrder(evaluation.chapterId)
    return
  }

  state.exams = state.exams.filter((item) => item.id !== id)
  state.attempts = state.attempts.filter(
    (attempt) => !(attempt.entityType === "exam" && attempt.entityId === id)
  )
}

function normalizeChapterOrder(chapterId: string) {
  const state = getState()
  state.evaluations
    .filter((item) => item.chapterId === chapterId)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .forEach((item, index) => {
      item.sortOrder = index
    })
}

export function moveEvaluation(id: string, direction: "up" | "down") {
  const state = getState()
  const current = state.evaluations.find((item) => item.id === id)
  if (!current) return

  const chapterItems = state.evaluations
    .filter((item) => item.chapterId === current.chapterId)
    .sort((left, right) => left.sortOrder - right.sortOrder)

  const index = chapterItems.findIndex((item) => item.id === id)
  if (index === -1) return

  const swapIndex = direction === "up" ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= chapterItems.length) return

  const target = chapterItems[swapIndex]
  const previousOrder = current.sortOrder
  current.sortOrder = target.sortOrder
  target.sortOrder = previousOrder
  normalizeChapterOrder(current.chapterId)
}

export function assignAssessment(input: {
  entityType: EntityType
  entityId: string
  assessment: AssessmentSummary
}) {
  const state = getState()

  if (input.entityType === "evaluation") {
    const evaluation = state.evaluations.find((item) => item.id === input.entityId)
    if (!evaluation) return
    assignAssessmentToEvaluation(evaluation, input.assessment)
    return
  }

  const exam = state.exams.find((item) => item.id === input.entityId)
  if (!exam) return
  assignAssessmentToExam(exam, input.assessment)
}

export function createAttempt(input: {
  entityType: EntityType
  entityId: string
  learnerRef: string
}) {
  const state = getState()
  const entity =
    input.entityType === "evaluation"
      ? state.evaluations.find((item) => item.id === input.entityId)
      : state.exams.find((item) => item.id === input.entityId)

  if (!entity || !entity.assessmentId || !entity.shareCode || !entity.assessmentTitle) {
    return null
  }

  const attempt: AttemptRecord = {
    id: randomUUID(),
    entityType: input.entityType,
    entityId: input.entityId,
    learnerRef: input.learnerRef,
    assessmentId: entity.assessmentId,
    assessmentTitle: entity.assessmentTitle,
    shareCode: entity.shareCode,
    submissionId: null,
    status: "pending",
    score: null,
    maxScore: null,
    percentage: null,
    passed: null,
    lastAttemptedAt: new Date().toISOString(),
    updatedViaWebhook: false,
  }

  state.attempts.unshift(attempt)
  return clone(attempt)
}

export function getAttemptById(attemptId: string) {
  const state = getState()
  const attempt = state.attempts.find((item) => item.id === attemptId)
  return attempt ? clone(attempt) : null
}

export function updateAttemptFromSubmissionResult(input: {
  attemptId: string
  result: SubmissionResult
  updatedViaWebhook: boolean
}) {
  const state = getState()
  const attempt = state.attempts.find((item) => item.id === input.attemptId)
  if (!attempt) return null

  if (attempt.assessmentId !== input.result.assessment_id) return null
  if (attempt.learnerRef !== input.result.learner_ref) return null

  attempt.submissionId = input.result.id
  attempt.status = "completed"
  attempt.score = input.result.score
  attempt.maxScore = input.result.max_score
  attempt.percentage = input.result.percentage
  attempt.passed = input.result.passed
  attempt.lastAttemptedAt = input.result.submitted_at
  attempt.updatedViaWebhook = input.updatedViaWebhook || attempt.updatedViaWebhook

  return clone(attempt)
}

export function updateLatestPendingAttemptFromWebhook(result: SubmissionResult) {
  const state = getState()
  const pending = state.attempts.find(
    (attempt) =>
      attempt.status === "pending" &&
      attempt.learnerRef === result.learner_ref &&
      attempt.assessmentId === result.assessment_id
  )

  if (!pending) return null

  return updateAttemptFromSubmissionResult({
    attemptId: pending.id,
    result,
    updatedViaWebhook: true,
  })
}

export function getLatestAttemptForEntity(entityType: EntityType, entityId: string) {
  const state = getState()
  const attempt = state.attempts.find(
    (item) => item.entityType === entityType && item.entityId === entityId
  )
  return attempt ? clone(attempt) : null
}

export function getLatestAttemptsMap() {
  const state = getState()
  const latestAttempts = new Map<string, AttemptRecord>()

  for (const attempt of state.attempts) {
    const key = `${attempt.entityType}:${attempt.entityId}`
    if (!latestAttempts.has(key)) {
      latestAttempts.set(key, clone(attempt))
    }
  }

  return latestAttempts
}

export function getAssessmentUsageMap() {
  const state = getState()
  const usage = new Map<
    string,
    { label: string; entityType: EntityType; entityId: string }[]
  >()

  state.evaluations.forEach((evaluation) => {
    if (!evaluation.assessmentId) return
    const current = usage.get(evaluation.assessmentId) ?? []
    current.push({
      label: evaluation.title,
      entityType: "evaluation",
      entityId: evaluation.id,
    })
    usage.set(evaluation.assessmentId, current)
  })

  state.exams.forEach((exam) => {
    if (!exam.assessmentId) return
    const current = usage.get(exam.assessmentId) ?? []
    current.push({
      label: exam.title,
      entityType: "exam",
      entityId: exam.id,
    })
    usage.set(exam.assessmentId, current)
  })

  return usage
}

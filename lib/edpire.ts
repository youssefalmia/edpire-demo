const BASE_URL = process.env.EDPIRE_API_BASE_URL ?? "https://edpire.com"
const API_KEY = process.env.EDPIRE_API_KEY ?? ""

interface ApiError {
  message?: string
}

interface ApiEnvelope<T> {
  data: T | null
  error?: ApiError | string | null
  meta?: {
    total?: number
    count?: number
    last_page?: number
    current_page?: number
  } | null
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: options?.cache ?? "no-store",
  })

  const json = (await res.json()) as ApiEnvelope<T>

  if (!res.ok || json.error) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error?.message ?? `API error ${res.status}`
    throw new Error(msg)
  }

  if (json.data === null) {
    throw new Error(`Edpire returned empty data for ${path}`)
  }

  return json.data
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  item_count: number
}

export interface AssessmentSummary {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  share_code: string
  max_score: number
  exercise_count: number
}

export interface SubmissionResult {
  id: string
  assessment_id: string
  learner_ref: string
  score: number
  max_score: number
  percentage: number
  passed: boolean
  submitted_at: string
}

export interface AssessmentResultRecord {
  id: string
  assessment_id: string
  learner_ref: string
  score: number
  max_score: number
  percentage: number
  passed: boolean
  submitted_at: string
}

function pickArrayCandidate(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  const candidates = [record.results, record.submissions, record.items, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeAssessmentResult(raw: unknown, assessmentId: string): AssessmentResultRecord | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>

  const id =
    typeof item.id === "string"
      ? item.id
      : typeof item.submission_id === "string"
      ? item.submission_id
      : typeof item.submissionId === "string"
      ? item.submissionId
      : null

  const learnerRef =
    typeof item.learner_ref === "string"
      ? item.learner_ref
      : typeof item.learnerRef === "string"
      ? item.learnerRef
      : null

  const score = toNumber(item.score)
  const maxScore = toNumber(item.max_score ?? item.maxScore)
  const percentage = toNumber(item.percentage)
  const passed =
    typeof item.passed === "boolean"
      ? item.passed
      : percentage !== null
      ? percentage >= 60
      : null

  const submittedAt =
    typeof item.submitted_at === "string"
      ? item.submitted_at
      : typeof item.submittedAt === "string"
      ? item.submittedAt
      : null

  const resolvedAssessmentId =
    typeof item.assessment_id === "string"
      ? item.assessment_id
      : typeof item.assessmentId === "string"
      ? item.assessmentId
      : assessmentId

  if (
    !id ||
    !learnerRef ||
    score === null ||
    maxScore === null ||
    percentage === null ||
    passed === null ||
    !submittedAt
  ) {
    return null
  }

  return {
    id,
    assessment_id: resolvedAssessmentId,
    learner_ref: learnerRef,
    score,
    max_score: maxScore,
    percentage,
    passed,
    submitted_at: submittedAt,
  }
}

export async function listCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>("/collections")
}

export async function listAssessments(): Promise<AssessmentSummary[]> {
  if (!API_KEY) return []

  const all: AssessmentSummary[] = []
  let page = 1
  const perPage = 20

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    })

    const res = await fetch(`${BASE_URL}/api/v1/assessments?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const json = (await res.json()) as ApiEnvelope<AssessmentSummary[]>

    if (!res.ok || json.error) {
      const msg =
        typeof json.error === "string"
          ? json.error
          : json.error?.message ?? `API error ${res.status}`
      throw new Error(msg)
    }

    const items = json.data ?? []
    all.push(...items)

    const lastPage = json.meta?.last_page
    if (lastPage !== undefined) {
      if (page >= lastPage) break
    } else if (items.length < perPage) {
      break
    }

    page += 1
  }

  return all
}

export async function getSubmission(submissionId: string): Promise<SubmissionResult | null> {
  if (!submissionId || !API_KEY) return null

  try {
    return await apiFetch<SubmissionResult>(`/submissions/${submissionId}`, {
      cache: "no-store",
    })
  } catch {
    return null
  }
}

export async function getAssessmentResults(assessmentId: string): Promise<AssessmentResultRecord[]> {
  if (!assessmentId || !API_KEY) return []

  const data = await apiFetch<unknown>(`/assessments/${assessmentId}/results`, {
    cache: "no-store",
  })

  return pickArrayCandidate(data)
    .map((item) => normalizeAssessmentResult(item, assessmentId))
    .filter((item): item is AssessmentResultRecord => Boolean(item))
    .sort((left, right) => Date.parse(right.submitted_at) - Date.parse(left.submitted_at))
}

const BASE_URL = "https://edpire.com"
const API_KEY = process.env.EDPIRE_API_KEY ?? ""

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error ?? `API error ${res.status}`)
  return json.data as T
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  item_count: number
}

export interface Assessment {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  share_code: string
  max_score: number
  exercises: Exercise[]
}

export interface Exercise {
  id: string
  shared_context: unknown | null
  questions: Question[]
}

export interface Question {
  id: string
  content_ast: ContentAST
  points: number
  sequence_number: number
}

export interface ContentAST {
  type: "doc"
  version: "1.0"
  content: ContentNode[]
}

export type ContentNode =
  | ParagraphNode
  | HeadingNode
  | TextNode
  | HardBreakNode
  | ChoiceSetNode
  | BlankNode
  | BlankPoolNode
  | { type: string; [key: string]: unknown }

export interface ParagraphNode { type: "paragraph"; content?: RichContent[] }
export interface HeadingNode { type: "heading"; attrs: { level: number }; content?: RichContent[] }
export interface TextNode { type: "text"; text: string; marks?: Mark[] }
export interface HardBreakNode { type: "hardBreak" }
export interface Mark { type: string; attrs?: Record<string, unknown> }

export interface RichContent {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  content?: RichContent[]
  marks?: Mark[]
}

export interface ChoiceOption {
  id: string
  content: RichContent[]
}

export interface ChoiceSetNode {
  type: "choiceSet"
  id: string
  attrs: {
    layout: "row" | "column"
    pickLimit: number
    shuffle: boolean
  }
  content: ChoiceOption[]
}

export interface BlankNode {
  type: "blank"
  id: string
  attrs: {
    mode: "choice" | "typed"
    placeholder?: string
  }
}

export interface BlankPoolNode {
  type: "blankPool"
  id: string
  content: ChoiceOption[]
}

// ── Runtime answer shapes (sent to /check) ───────────────────────────────────

export interface ChoiceSetAnswer {
  nodeId: string
  type: "choiceSet"
  timestamp: number
  answer: { selectedIds: string[] }
}

export interface TypedBlankAnswer {
  nodeId: string
  type: "blank"
  timestamp: number
  answer: { mode: "typed"; text: string }
}

export type RuntimeAnswer = ChoiceSetAnswer | TypedBlankAnswer

// ── Flat question list ────────────────────────────────────────────────────────

export interface FlatQuestion {
  exerciseId: string
  questionId: string
  contentAst: ContentAST
  points: number
  index: number
}

export function flattenAssessment(assessment: Assessment): FlatQuestion[] {
  const flat: FlatQuestion[] = []
  let index = 0
  for (const exercise of assessment.exercises) {
    for (const question of exercise.questions) {
      flat.push({
        exerciseId: exercise.id,
        questionId: question.id,
        contentAst: question.content_ast,
        points: question.points,
        index: index++,
      })
    }
  }
  return flat
}

// ── API calls (server-side) ───────────────────────────────────────────────────

export async function listCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>("/collections")
}

export async function getAssessment(id: string): Promise<Assessment> {
  return apiFetch<Assessment>(`/assessments/${id}`)
}

export async function listAssessments(): Promise<Assessment[]> {
  return apiFetch<Assessment[]>("/assessments")
}

export interface CheckResult {
  correct: boolean
  score: number
  max_score: number
  feedback: Record<string, unknown>
}

export async function checkQuestion(
  assessmentId: string,
  payload: {
    exercise_id: string
    question_id: string
    answers: RuntimeAnswer[]
    learner_ref: string
    session_id?: string
    include_correct_answers?: boolean
  },
): Promise<CheckResult> {
  return apiFetch<CheckResult>(`/assessments/${assessmentId}/check`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

import { NextResponse } from "next/server"
import { checkQuestion } from "@/lib/edpire"
import type { RuntimeAnswer } from "@/lib/edpire"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await req.json() as {
      exercise_id: string
      question_id: string
      answers: RuntimeAnswer[]
      learner_ref: string
      session_id?: string
      include_correct_answers?: boolean
    }
    const result = await checkQuestion(id, body)
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

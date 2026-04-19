import { NextResponse } from "next/server"
import { getAssessment } from "@/lib/edpire"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const assessment = await getAssessment(id)
    return NextResponse.json({ data: assessment })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

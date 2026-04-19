"use client"

import type {
  ContentAST,
  ContentNode,
  RichContent,
  ChoiceSetNode,
  BlankNode,
  BlankPoolNode,
  ChoiceSetAnswer,
  TypedBlankAnswer,
  RuntimeAnswer,
} from "@/lib/edpire"

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractText(nodes: RichContent[] | undefined): string {
  if (!nodes) return ""
  return nodes
    .map((n) => {
      if (n.text) return n.text
      if (n.content) return extractText(n.content)
      return ""
    })
    .join("")
}

function renderInline(nodes: RichContent[] | undefined): React.ReactNode {
  if (!nodes) return null
  return nodes.map((node, i) => {
    if (node.type === "hardBreak") return <br key={i} />
    if (node.type === "text") {
      let el: React.ReactNode = node.text ?? ""
      const marks = node.marks ?? []
      for (const mark of marks) {
        if (mark.type === "bold") el = <strong key={i}>{el}</strong>
        else if (mark.type === "italic") el = <em key={i}>{el}</em>
        else if (mark.type === "code") el = <code key={i} className="bg-slate-100 px-1 rounded text-sm font-mono">{el}</code>
      }
      return <span key={i}>{el}</span>
    }
    if (node.content) return <span key={i}>{renderInline(node.content)}</span>
    return null
  })
}

// ── Answer state helpers ──────────────────────────────────────────────────────

export type AnswerMap = Map<string, RuntimeAnswer>

function isChoiceSetNode(node: ContentNode): node is ChoiceSetNode {
  return node.type === "choiceSet"
}

function isBlankNode(node: ContentNode): node is BlankNode {
  return node.type === "blank" && (node as BlankNode).attrs?.mode === "typed"
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuestionRendererProps {
  contentAst: ContentAST
  answers: AnswerMap
  onAnswer: (answer: RuntimeAnswer) => void
  disabled?: boolean
  feedback?: Record<string, { correct?: boolean; message?: string }>
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuestionRenderer({ contentAst, answers, onAnswer, disabled, feedback }: QuestionRendererProps) {
  const nodes = contentAst.content ?? []

  return (
    <div className="space-y-4 text-slate-800">
      {nodes.map((node, i) => (
        <RenderNode
          key={i}
          node={node}
          answers={answers}
          onAnswer={onAnswer}
          disabled={disabled}
          feedback={feedback}
          allNodes={nodes}
        />
      ))}
    </div>
  )
}

// ── Per-node renderer ─────────────────────────────────────────────────────────

function RenderNode({
  node,
  answers,
  onAnswer,
  disabled,
  feedback,
  allNodes,
}: {
  node: ContentNode
  answers: AnswerMap
  onAnswer: (answer: RuntimeAnswer) => void
  disabled?: boolean
  feedback?: Record<string, { correct?: boolean; message?: string }>
  allNodes: ContentNode[]
}) {
  if (node.type === "paragraph") {
    const p = node as { type: "paragraph"; content?: RichContent[] }
    return <p className="leading-relaxed">{renderInline(p.content)}</p>
  }

  if (node.type === "heading") {
    const h = node as { type: "heading"; attrs: { level: number }; content?: RichContent[] }
    const sizes: Record<number, string> = { 1: "text-xl", 2: "text-lg", 3: "text-base" }
    const cls = `font-semibold ${sizes[h.attrs.level] ?? "text-base"}`
    const text = renderInline(h.content)
    if (h.attrs.level === 1) return <h1 className={cls}>{text}</h1>
    if (h.attrs.level === 2) return <h2 className={cls}>{text}</h2>
    if (h.attrs.level === 3) return <h3 className={cls}>{text}</h3>
    return <h4 className={cls}>{text}</h4>
  }

  if (isChoiceSetNode(node)) {
    const ans = answers.get(node.id) as ChoiceSetAnswer | undefined
    const selectedIds = ans?.answer.selectedIds ?? []
    const isMulti = node.attrs.pickLimit > 1
    const nodeFeedback = feedback?.[node.id]

    return (
      <div className="space-y-2">
        {node.content.map((choice) => {
          const isSelected = selectedIds.includes(choice.id)
          const isCorrect = nodeFeedback?.correct === true && isSelected
          const isWrong = nodeFeedback?.correct === false && isSelected

          return (
            <button
              key={choice.id}
              disabled={disabled}
              onClick={() => {
                if (disabled) return
                const newIds = isMulti
                  ? isSelected
                    ? selectedIds.filter((id) => id !== choice.id)
                    : [...selectedIds, choice.id]
                  : [choice.id]

                onAnswer({
                  nodeId: node.id,
                  type: "choiceSet",
                  timestamp: Date.now(),
                  answer: { selectedIds: newIds },
                } satisfies ChoiceSetAnswer)
              }}
              className={[
                "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                isCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : isWrong
                  ? "border-red-400 bg-red-50 text-red-800"
                  : isSelected
                  ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700",
                disabled ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className={[
                  "w-4 h-4 rounded shrink-0 border flex items-center justify-center text-xs",
                  isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300",
                  isMulti ? "rounded" : "rounded-full",
                ].join(" ")}>
                  {isSelected && "✓"}
                </span>
                {extractText(choice.content)}
              </span>
            </button>
          )
        })}
        {nodeFeedback?.message && (
          <p className={`text-sm mt-1 ${nodeFeedback.correct ? "text-emerald-600" : "text-red-600"}`}>
            {nodeFeedback.message}
          </p>
        )}
      </div>
    )
  }

  if (isBlankNode(node)) {
    const blank = node as BlankNode
    const ans = answers.get(blank.id) as TypedBlankAnswer | undefined
    const nodeFeedback = feedback?.[blank.id]

    return (
      <div className="space-y-1">
        <input
          type="text"
          disabled={disabled}
          placeholder={blank.attrs.placeholder ?? "Your answer…"}
          value={ans?.answer.text ?? ""}
          onChange={(e) => {
            onAnswer({
              nodeId: blank.id,
              type: "blank",
              timestamp: Date.now(),
              answer: { mode: "typed", text: e.target.value },
            } satisfies TypedBlankAnswer)
          }}
          className={[
            "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all",
            nodeFeedback?.correct === true
              ? "border-emerald-400 bg-emerald-50"
              : nodeFeedback?.correct === false
              ? "border-red-400 bg-red-50"
              : "border-slate-300 focus:border-indigo-400",
          ].join(" ")}
        />
        {nodeFeedback?.message && (
          <p className={`text-sm ${nodeFeedback.correct ? "text-emerald-600" : "text-red-600"}`}>
            {nodeFeedback.message}
          </p>
        )}
      </div>
    )
  }

  // Unsupported node — show a hint
  return (
    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 italic">
      [{node.type}] — this node type is rendered by{" "}
      <code className="text-xs">@edpire/sdk/react</code> in production.
    </div>
  )
}

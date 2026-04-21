"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  Check,
  CirclePlus,
  FilePenLine,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import type {
  Chapter,
  EntityStatus,
  EvaluationEntity,
  ExamEntity,
} from "@/lib/demo-store"
import type { AssessmentSummary } from "@/lib/edpire"
import {
  assignAssessmentAction,
  createEntityFromAssessmentAction,
  createEvaluationAction,
  createExamAction,
  deleteEntityAction,
  moveEvaluationAction,
  saveEvaluationAction,
  saveExamAction,
} from "@/lib/demo-actions"

interface UsageItem {
  entityId: string
  entityType: "evaluation" | "exam"
  label: string
}

interface Props {
  chapters: Chapter[]
  evaluations: EvaluationEntity[]
  exams: ExamEntity[]
  assessments: AssessmentSummary[]
  usageByAssessmentId: Record<string, UsageItem[]>
  assessmentError: string | null
}

type TabId = "evaluation" | "exam"
type AssessmentPanelFilter = "all" | "unassigned" | "assigned"

function statusPill(status: EntityStatus) {
  if (status === "published") return "bg-emerald-100 text-emerald-700"
  if (status === "archived") return "bg-slate-200 text-slate-600"
  return "bg-amber-100 text-amber-700"
}

function statusLabel(status: EntityStatus) {
  if (status === "published") return "Published"
  if (status === "archived") return "Archived"
  return "Draft"
}

export function DemoBuilder({
  chapters,
  evaluations,
  exams,
  assessments,
  usageByAssessmentId,
  assessmentError,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabId>("evaluation")
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(evaluations[0]?.id ?? null)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(exams[0]?.id ?? null)
  const [entityFilter, setEntityFilter] = useState<"all" | EntityStatus>("all")
  const [assessmentSearch, setAssessmentSearch] = useState("")
  const [assessmentFilter, setAssessmentFilter] = useState<AssessmentPanelFilter>("all")

  const selectedEntity =
    activeTab === "evaluation"
      ? evaluations.find((item) => item.id === selectedEvaluationId) ?? null
      : exams.find((item) => item.id === selectedExamId) ?? null

  useEffect(() => {
    if (activeTab === "evaluation") {
      if (!evaluations.some((item) => item.id === selectedEvaluationId)) {
        setSelectedEvaluationId(evaluations[0]?.id ?? null)
      }
      return
    }

    if (!exams.some((item) => item.id === selectedExamId)) {
      setSelectedExamId(exams[0]?.id ?? null)
    }
  }, [activeTab, evaluations, exams, selectedEvaluationId, selectedExamId])

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      if (entityFilter === "all") return true
      return item.status === entityFilter
    })
  }, [entityFilter, evaluations])

  const filteredExams = useMemo(() => {
    return exams.filter((item) => {
      if (entityFilter === "all") return true
      return item.status === entityFilter
    })
  }, [entityFilter, exams])

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.title.toLowerCase().includes(assessmentSearch.toLowerCase()) ||
        assessment.id.toLowerCase().includes(assessmentSearch.toLowerCase())

      if (!matchesSearch) return false

      const assignedCount = usageByAssessmentId[assessment.id]?.length ?? 0
      if (assessmentFilter === "assigned") return assignedCount > 0
      if (assessmentFilter === "unassigned") return assignedCount === 0
      return true
    })
  }, [assessmentFilter, assessmentSearch, assessments, usageByAssessmentId])

  async function runAction(task: () => Promise<unknown>) {
    startTransition(async () => {
      await task()
      router.refresh()
    })
  }

  async function handleCreateEmpty() {
    await runAction(async () => {
      if (activeTab === "evaluation") {
        await createEvaluationAction()
      } else {
        await createExamAction()
      }
    })
  }

  async function handleSave() {
    if (!selectedEntity) return

    const formData = new FormData()
    formData.set("id", selectedEntity.id)
    formData.set("title", formValues.title)
    formData.set("description", formValues.description)
    formData.set("status", formValues.status)
    formData.set("isFree", String(formValues.isFree))

    if (activeTab === "evaluation") {
      formData.set("chapterId", formValues.chapterId)
      await runAction(async () => {
        await saveEvaluationAction(formData)
      })
      return
    }

    formData.set("difficulty", formValues.difficulty)
    await runAction(async () => {
      await saveExamAction(formData)
    })
  }

  async function handleDelete() {
    if (!selectedEntity) return

    const formData = new FormData()
    formData.set("id", selectedEntity.id)
    formData.set("entityType", activeTab)

    await runAction(async () => {
      await deleteEntityAction(formData)
    })
  }

  async function handleAssign(assessment: AssessmentSummary) {
    if (!selectedEntity) return

    const formData = new FormData()
    formData.set("entityType", activeTab)
    formData.set("entityId", selectedEntity.id)
    formData.set("assessmentId", assessment.id)
    formData.set("assessmentTitle", assessment.title)
    formData.set("assessmentShareCode", assessment.share_code)
    formData.set("assessmentStatus", assessment.status)
    formData.set("assessmentMaxScore", String(assessment.max_score ?? 0))

    await runAction(async () => {
      await assignAssessmentAction(formData)
    })
  }

  async function handleCreateFromAssessment(entityType: TabId, assessment: AssessmentSummary) {
    const formData = new FormData()
    formData.set("entityType", entityType)
    formData.set("assessmentId", assessment.id)
    formData.set("assessmentTitle", assessment.title)
    formData.set("assessmentShareCode", assessment.share_code)
    formData.set("assessmentStatus", assessment.status)
    formData.set("assessmentMaxScore", String(assessment.max_score ?? 0))

    await runAction(async () => {
      await createEntityFromAssessmentAction(formData)
    })
  }

  async function handleMove(direction: "up" | "down", id: string) {
    const formData = new FormData()
    formData.set("id", id)
    formData.set("direction", direction)

    await runAction(async () => {
      await moveEvaluationAction(formData)
    })
  }

  const [formValues, setFormValues] = useState({
    title: selectedEntity?.title ?? "",
    description: selectedEntity?.description ?? "",
    status: selectedEntity?.status ?? "draft",
    isFree: selectedEntity?.isFree ?? false,
    chapterId:
      selectedEntity && "chapterId" in selectedEntity ? selectedEntity.chapterId : chapters[0]?.id ?? "",
    difficulty:
      selectedEntity && "difficulty" in selectedEntity ? selectedEntity.difficulty : "medium",
  })

  useEffect(() => {
    setFormValues({
      title: selectedEntity?.title ?? "",
      description: selectedEntity?.description ?? "",
      status: selectedEntity?.status ?? "draft",
      isFree: selectedEntity?.isFree ?? false,
      chapterId:
        selectedEntity && "chapterId" in selectedEntity
          ? selectedEntity.chapterId
          : chapters[0]?.id ?? "",
      difficulty:
        selectedEntity && "difficulty" in selectedEntity ? selectedEntity.difficulty : "medium",
    })
  }, [selectedEntity, chapters])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#f8fafc,white)] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Builder
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Build your own evaluation layer
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The left side is your product model. The right side is the Edpire assessment catalog.
                This demo stores everything in temporary in-memory state so teams can see the pattern
                clearly before plugging in a real database.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateEmpty}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <CirclePlus size={16} />
              New {activeTab === "evaluation" ? "Evaluation" : "Exam"}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {([
              ["evaluation", "Evaluations"],
              ["exam", "Exams"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}

            <div className="ml-auto flex flex-wrap gap-2">
              {(["all", "draft", "published", "archived"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEntityFilter(value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    entityFilter === value
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {value === "all" ? "All statuses" : statusLabel(value)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-r border-slate-200 bg-slate-50/60">
            {activeTab === "evaluation" ? (
              <div className="space-y-5 p-5">
                {chapters.map((chapter) => {
                  const items = filteredEvaluations
                    .filter((item) => item.chapterId === chapter.id)
                    .sort((left, right) => left.sortOrder - right.sortOrder)

                  return (
                    <div key={chapter.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{chapter.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{chapter.description}</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        {items.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                            No evaluations in this chapter for the current filter.
                          </p>
                        ) : (
                          items.map((item) => (
                            <div
                              key={item.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedEvaluationId(item.id)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault()
                                  setSelectedEvaluationId(item.id)
                                }
                              }}
                              className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                                selectedEvaluationId === item.id
                                  ? "border-sky-300 bg-sky-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{item.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.description}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusPill(item.status)}`}
                                >
                                  {statusLabel(item.status)}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                                  <span>{item.isFree ? "Free access" : "Premium gate"}</span>
                                  <span>{item.assessmentId ? "Assigned" : "Unassigned"}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                    #{item.sortOrder + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleMove("up", item.id)
                                    }}
                                    className="rounded-full border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleMove("down", item.id)
                                    }}
                                    className="rounded-full border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3 p-5">
                {filteredExams.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedExamId(item.id)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      selectedExamId === item.id
                        ? "border-violet-300 bg-violet-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusPill(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
                        {item.difficulty}
                      </span>
                      <span>{item.isFree ? "Free access" : "Premium gate"}</span>
                      <span>{item.assessmentId ? "Assigned" : "Unassigned"}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            {selectedEntity ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Selected {activeTab}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {selectedEntity.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    Delete wrapper
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Title</span>
                    <input
                      value={formValues.title}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, title: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Status</span>
                    <select
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          status: event.target.value as EntityStatus,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Description</span>
                  <textarea
                    value={formValues.description}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={4}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Visibility</span>
                    <select
                      value={String(formValues.isFree)}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          isFree: event.target.value === "true",
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                    >
                      <option value="false">Premium only</option>
                      <option value="true">Free</option>
                    </select>
                  </label>

                  {activeTab === "evaluation" ? (
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Chapter</span>
                      <select
                        value={formValues.chapterId}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            chapterId: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                      >
                        {chapters.map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Difficulty</span>
                      <select
                        value={formValues.difficulty}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            difficulty: event.target.value as "easy" | "medium" | "hard",
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Assessment binding
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedEntity.assessmentTitle ?? "No Edpire assessment assigned yet"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedEntity.assessmentId
                          ? `Assessment ID: ${selectedEntity.assessmentId}`
                          : "Assign from the right panel or create directly from an Edpire assessment."}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                      {selectedEntity.assessmentId ? "Connected to Edpire" : "Awaiting assignment"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
                  >
                    <FilePenLine size={15} />
                    Save wrapper
                  </button>
                  <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500">
                    Fixed demo storage: temporary in-memory state only
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
                Select an entity on the left to edit its local metadata.
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fefce8,white)] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Edpire catalog
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                All assessments in your org
              </h2>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
              {filteredAssessments.length} visible
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3">
            <Search size={15} className="text-slate-400" />
            <input
              value={assessmentSearch}
              onChange={(event) => setAssessmentSearch(event.target.value)}
              placeholder="Search by title or ID"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {([
              ["all", "All"],
              ["unassigned", "Unassigned"],
              ["assigned", "Assigned"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAssessmentFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  assessmentFilter === value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[75rem] overflow-y-auto p-4">
          {assessmentError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {assessmentError}
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No assessments matched the current search or filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssessments.map((assessment) => {
                const usage = usageByAssessmentId[assessment.id] ?? []
                const selectedHasSameAssessment =
                  selectedEntity?.assessmentId === assessment.id

                return (
                  <div key={assessment.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{assessment.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-400">{assessment.id}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        {assessment.max_score} pts
                      </span>
                    </div>

                    {usage.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {usage.map((item) => (
                          <span
                            key={`${item.entityType}-${item.entityId}`}
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                              item.entityType === "evaluation"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-violet-100 text-violet-700"
                            }`}
                          >
                            {item.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCreateFromAssessment("evaluation", assessment)}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Sparkles size={13} />
                        Create Evaluation
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateFromAssessment("exam", assessment)}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Sparkles size={13} />
                        Create Exam
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssign(assessment)}
                        disabled={isPending || !selectedEntity}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                          selectedHasSameAssessment
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        {selectedHasSameAssessment ? <Check size={13} /> : null}
                        {selectedHasSameAssessment
                          ? "Assigned to selected"
                          : selectedEntity
                          ? `Assign to selected ${activeTab}`
                          : "Select an entity first"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

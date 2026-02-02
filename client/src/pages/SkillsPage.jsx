import { useMemo, useState } from "react"
import SkillForm from "../components/SkillForm"
import SkillList from "../components/SkillList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SkillsPage({ skills, loading, disabled, onAdd, onDelete, onPractice }) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = useMemo(() => {
    const set = new Set()
    for (const s of skills) if (s.category) set.add(s.category)
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [skills])

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()
    return skills.filter((s) => {
      const matchesName = !q || String(s.name ?? "").toLowerCase().includes(q)
      const matchesCategory =
        categoryFilter === "all" || String(s.category ?? "") === categoryFilter
      return matchesName && matchesCategory
    })
  }, [skills, search, categoryFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add skills, practice them, and keep the list clean.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="bg-background/60 backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle>Add a skill</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillForm onAdd={onAdd} disabled={disabled} />
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Your skills{" "}
              <span className="text-muted-foreground font-normal">
                ({filteredSkills.length}/{skills.length})
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Filters toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 sm:w-56"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            {loading ? (
              <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : (
              <SkillList
                skills={filteredSkills}
                onDelete={onDelete}
                onPractice={onPractice}
                disabled={disabled}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// client/src/App.jsx
import { useEffect, useMemo, useState } from "react"
import { getSkills, createSkill, deleteSkill, practiceSkill } from "./api/skillsApi"

import SkillForm from "./components/SkillForm"
import SkillList from "./components/SkillList"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function App() {
  // ---- Server data state ----
  const [skills, setSkills] = useState([]) // array of skills from backend
  const [loading, setLoading] = useState(false) // "fetching list" flag
  const [mutating, setMutating] = useState(false) // "add/delete/practice in progress" flag
  const [error, setError] = useState("") // last error message to show in UI

  // ---- UI state ----
  const [search, setSearch] = useState("") // text filter
  const [categoryFilter, setCategoryFilter] = useState("all") // category dropdown

  // Sorting state used by SkillList headers
  const [sortKey, setSortKey] = useState("decay_score") // default: most useful column
  const [sortDir, setSortDir] = useState("desc") // default: highest decay first

  // Fetch skills from backend and store them in state
  async function loadSkills() {
    setLoading(true)
    setError("")
    try {
      const data = await getSkills()
      setSkills(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(String(e?.message || e))
      setSkills([])
    } finally {
      setLoading(false)
    }
  }

  // Load once on page mount
  useEffect(() => {
    loadSkills()
  }, [])

  // Add skill (POST) then refresh list
  async function handleAdd({ name, category }) {
    setError("")
    setMutating(true)
    try {
      await createSkill({ name, category })
      await loadSkills()
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setMutating(false)
    }
  }

  // Delete skill (DELETE) and update UI locally
  async function handleDelete(id) {
    setError("")
    setMutating(true)
    try {
      await deleteSkill(id)
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setMutating(false)
    }
  }

  // Practice skill (POST /practice) and merge returned updated row into state
  async function handlePractice(id) {
    setError("")
    setMutating(true)
    try {
      const updated = await practiceSkill(id)
      setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setMutating(false)
    }
  }

  // Toggle or set sorting when the user clicks a table header in SkillList
  function handleChangeSort(key) {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return prevKey
      }
      // default direction per column
      setSortDir(key === "name" ? "asc" : "desc")
      return key
    })
  }

  // Filtered list (search + category)
  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()

    return skills.filter((s) => {
      const matchesName = !q || String(s?.name || "").toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "all" || String(s?.category || "") === categoryFilter
      return matchesName && matchesCategory
    })
  }, [skills, search, categoryFilter])

  // Category dropdown options (derived from skills)
  const categories = useMemo(() => {
    const set = new Set()
    for (const s of skills) {
      if (s?.category) set.add(s.category)
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [skills])

  // Disable buttons while loading or mutating (prevents double clicks)
  const disabled = loading || mutating

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">Skill Decay Tracker</h1>
          <p className="text-muted-foreground">
            Track skills you’re learning, practice on time, and keep your list clean.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left card: Add */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add a skill</CardTitle>
              <p className="text-sm text-muted-foreground">Keep it short and consistent.</p>
            </CardHeader>
            <CardContent>
              <SkillForm onAdd={handleAdd} disabled={disabled} />
            </CardContent>
          </Card>

          {/* Right card: List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <CardTitle>
                  Your skills{" "}
                  <span className="text-muted-foreground font-normal">
                    ({filteredSkills.length}/{skills.length})
                  </span>
                </CardTitle>

                <span className="text-sm text-muted-foreground">
                  Search + filter, then sort by clicking table headers.
                </span>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filters toolbar */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Search skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-56"
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
                <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <SkillList
                  skills={filteredSkills}
                  onDelete={handleDelete}
                  onPractice={handlePractice}
                  disabled={disabled}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onChangeSort={handleChangeSort}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

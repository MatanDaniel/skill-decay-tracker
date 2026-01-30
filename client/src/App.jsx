import { useEffect, useMemo, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { getSkills, createSkill, deleteSkill, practiceSkill } from "./api/skillsApi"

import AppLayout from "./layout/AppLayout"
import Dashboard from "./pages/Dashboard"
import SkillsPage from "./pages/SkillsPage"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function App() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [sortKey, setSortKey] = useState("decay_score")
  const [sortDir, setSortDir] = useState("desc")

  // Loads skills from backend into React state.
  async function loadSkills() {
    setLoading(true)
    setError("")
    try {
      const data = await getSkills()
      setSkills(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  // Sorts skills in-memory (doesn't change backend order).
  const sortedSkills = useMemo(() => {
    const copy = [...skills]

    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1

      const av = a?.[sortKey]
      const bv = b?.[sortKey]

      // numeric sort for decay_score
      if (sortKey === "decay_score") return (Number(av) - Number(bv)) * dir

      // date sort
      if (sortKey === "last_practiced_at") return (new Date(av) - new Date(bv)) * dir

      // string sort fallback
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir
    })

    return copy
  }, [skills, sortKey, sortDir])

  // Toggles sorting when clicking a column header.
  function handleChangeSort(key) {
    setSortKey((prevKey) => {
      if (prevKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      else setSortDir(key === "name" ? "asc" : "desc")
      return key
    })
  }

  // Filters by search + category.
  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sortedSkills.filter((s) => {
      const matchesName = !q || String(s?.name ?? "").toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "all" || (s?.category ?? "") === categoryFilter
      return matchesName && matchesCategory
    })
  }, [sortedSkills, search, categoryFilter])

  // Builds dropdown categories from data.
  const categories = useMemo(() => {
    const set = new Set()
    for (const s of skills) if (s?.category) set.add(s.category)
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [skills])

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

  const disabled = loading || mutating

  return (
    <BrowserRouter>
      <AppLayout>
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard skills={skills} />} />
          <Route
            path="/skills"
            element={
              <SkillsPage
                skills={skills}
                filteredSkills={filteredSkills}
                disabled={disabled}
                loading={loading}
                handleAdd={handleAdd}
                handleDelete={handleDelete}
                handlePractice={handlePractice}
                sortKey={sortKey}
                sortDir={sortDir}
                handleChangeSort={handleChangeSort}
                search={search}
                setSearch={setSearch}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categories={categories}
              />
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

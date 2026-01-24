import { useEffect, useMemo, useState } from "react"
import { getSkills, createSkill, deleteSkill, practiceSkill } from "./api/skillsApi"

import SkillForm from "./components/SkillForm"
import SkillList from "./components/SkillList"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function App() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState("")

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

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      const c = String(a.category || "").localeCompare(String(b.category || ""))
      if (c !== 0) return c
      return String(a.name || "").localeCompare(String(b.name || ""))
    })
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

    // Update only that one item in React state
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    )
  } catch (e) {
    setError(String(e?.message || e))
  } finally {
    setMutating(false)
  }
}
const [sortKey, setSortKey] = useState("decay_score") // default: most useful
const [sortDir, setSortDir] = useState("desc")        // highest decay first

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



  const disabled = loading || mutating

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">
            Skill Decay Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track skills you’re learning and keep your list clean. 
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a skill</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillForm onAdd={handleAdd} disabled={disabled} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Your skills{" "}
                <span className="text-muted-foreground font-normal">
                  ({sortedSkills.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : (
                <SkillList
                  skills={skills}
                  onDelete={handleDelete}
                  onPractice={handlePractice}
                  disabled={loading}
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

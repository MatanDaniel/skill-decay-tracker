import { useEffect, useMemo, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { getSkills, createSkill, deleteSkill, practiceSkill } from "./api/skillsApi"

import AppLayout from "./layout/AppLayout"
import Dashboard from "./pages/Dashboard"
import SkillsPage from "./pages/SkillsPage"
import SkillDetails from "./pages/SkillDetails"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"

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

  // Dashboard-friendly derived stats
  const stats = useMemo(() => {
    const total = skills.length
    const decayValues = skills.map((s) => Number(s.decay_score ?? 0))
    const avg = total ? Math.round(decayValues.reduce((a, b) => a + b, 0) / total) : 0
    const high = skills.filter((s) => Number(s.decay_score ?? 0) >= 70).length

    // Next to practice = top decay first
    const nextToPractice = [...skills]
      .sort((a, b) => Number(b.decay_score ?? 0) - Number(a.decay_score ?? 0))
      .slice(0, 6)

    return { total, avg, high, nextToPractice }
  }, [skills])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppLayout
              error={error}
              onClearError={() => setError("")}
              loading={loading}
            />
          }
        >
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                skills={skills}
                stats={stats}
                onPractice={handlePractice}
                onDelete={handleDelete}
                disabled={disabled}
              />
            }
          />
          <Route
            path="/skills"
            element={
              <SkillsPage
                skills={skills}
                loading={loading}
                disabled={disabled}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onPractice={handlePractice}
              />
            }
          />
          <Route
            path="/skills/:id"
            element={<SkillDetails skills={skills} />}
          />
          <Route path="/reports" element={<Reports skills={skills} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

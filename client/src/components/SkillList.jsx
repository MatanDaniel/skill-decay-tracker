import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatLastPracticed(value) {
  if (!value) return "Never"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "Unknown"
  return d.toLocaleString()
}

// Fallback until backend returns decay_score.
// 0..100. 0 = fresh, 100 = fully decayed.
function fallbackDecayScore(lastPracticedAt) {
  if (!lastPracticedAt) return 100
  const last = new Date(lastPracticedAt)
  if (Number.isNaN(last.getTime())) return 100

  const now = new Date()
  const days = (now - last) / (1000 * 60 * 60 * 24)

  // Simple model: +5 points per day, capped at 100.
  const score = Math.min(100, Math.max(0, Math.round(days * 5)))
  return score
}

function decayBadgeVariant(score) {
  if (score >= 70) return "destructive"
  if (score >= 35) return "secondary"
  return "outline"
}

export default function SkillList({
  skills,
  onDelete,
  onPractice,
  disabled,
  sortKey,
  sortDir,
  onChangeSort,
}) {
  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1

    return [...skills].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * dir
      }

      if (sortKey === "last_practiced_at") {
        const aT = a.last_practiced_at ? new Date(a.last_practiced_at).getTime() : 0
        const bT = b.last_practiced_at ? new Date(b.last_practiced_at).getTime() : 0
        return (aT - bT) * dir
      }

      // decay_score (preferred) or fallback
      const aD = typeof a.decay_score === "number" ? a.decay_score : fallbackDecayScore(a.last_practiced_at)
      const bD = typeof b.decay_score === "number" ? b.decay_score : fallbackDecayScore(b.last_practiced_at)
      return (aD - bD) * dir
    })
  }, [skills, sortKey, sortDir])

  if (!skills.length) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No skills yet. Add your first skill above.
      </div>
    )
  }

  const SortButton = ({ k, label }) => {
    const active = sortKey === k
    const arrow = active ? (sortDir === "asc" ? " ↑" : " ↓") : ""
    return (
      <button
        type="button"
        onClick={() => onChangeSort(k)}
        className={`font-semibold ${active ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
      >
        {label}{arrow}
      </button>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[26%]"><SortButton k="name" label="Skill" /></TableHead>
            <TableHead className="w-[18%]">Category</TableHead>
            <TableHead className="w-[22%]"><SortButton k="last_practiced_at" label="Last practiced" /></TableHead>
            <TableHead className="w-[14%]"><SortButton k="decay_score" label="Decay" /></TableHead>
            <TableHead className="w-[20%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.map((s) => {
            const score = typeof s.decay_score === "number"
              ? s.decay_score
              : fallbackDecayScore(s.last_practiced_at)

            return (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>

                <TableCell>
                  <Badge variant="outline">{s.category}</Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatLastPracticed(s.last_practiced_at)}
                </TableCell>

                <TableCell>
                  <Badge variant={decayBadgeVariant(score)}>{score}</Badge>
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onPractice(s.id)}
                  >
                    Practice
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onDelete(s.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

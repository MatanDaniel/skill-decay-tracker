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

// If backend doesn't return decay_score yet, compute a fallback from last_practiced_at.
// 0..100 where 0 = fresh, 100 = fully decayed.
function fallbackDecayScore(lastPracticedAt) {
  const MAX_DAYS = 30
  if (!lastPracticedAt) return 100
  const last = new Date(lastPracticedAt)
  if (Number.isNaN(last.getTime())) return 100

  const now = Date.now()
  const days = (now - last.getTime()) / (1000 * 60 * 60 * 24)
  const score = Math.round((days / MAX_DAYS) * 100)
  return Math.max(0, Math.min(100, score))
}

function decayBadgeVariant(score) {
  if (score >= 80) return "destructive"
  if (score >= 50) return "secondary"
  return "outline"
}

function decayBarClass(score) {
  if (score >= 80) return "bg-red-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-emerald-500"
}

function formatLastPracticed(dt) {
  if (!dt) return "Never"
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString()
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
        return String(a.name ?? "").localeCompare(String(b.name ?? "")) * dir
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
      <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
        No skills yet. Add your first skill above.
      </div>
    )
  }

  const SortButton = ({ k, label }) => {
    const active = sortKey === k
    const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : ""
    return (
      <button
        type="button"
        onClick={() => onChangeSort(k)}
        className={`inline-flex items-center gap-2 font-medium ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
        <span className="text-xs">{arrow}</span>
      </button>
    )
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="w-[26%]">
              <SortButton k="name" label="Skill" />
            </TableHead>
            <TableHead className="w-[18%]">Category</TableHead>
            <TableHead className="w-[24%]">
              <SortButton k="last_practiced_at" label="Last practiced" />
            </TableHead>
            <TableHead className="w-[16%]">
              <SortButton k="decay_score" label="Decay" />
            </TableHead>
            <TableHead className="w-[16%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.map((s, idx) => {
            const score =
              typeof s.decay_score === "number"
                ? s.decay_score
                : fallbackDecayScore(s.last_practiced_at)

            return (
              <TableRow
                key={s.id}
                className={`transition-colors hover:bg-muted/40 ${
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                }`}
              >
                <TableCell className="font-medium">{s.name}</TableCell>

                <TableCell>
                  <Badge variant="outline" className="rounded-full px-3">
                    {s.category || "—"}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatLastPracticed(s.last_practiced_at)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Badge variant={decayBadgeVariant(score)} className="w-11 justify-center">
                      {score}
                    </Badge>

                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${decayBarClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
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
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

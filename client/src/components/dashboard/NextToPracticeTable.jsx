import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function level(decay) {
  const v = Number(decay ?? 0)
  if (v >= 80) return { label: "Critical", variant: "destructive" }
  if (v >= 60) return { label: "High", variant: "default" }
  if (v >= 30) return { label: "Medium", variant: "secondary" }
  return { label: "Low", variant: "outline" }
}

export default function NextToPracticeTable({ skills, onPractice, onDelete, disabled }) {
  if (!skills.length) {
    return <div className="text-sm text-muted-foreground">No skills yet.</div>
  }

  return (
    <div className="space-y-2">
      {skills.map((s) => {
        const info = level(s.decay_score)
        return (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl border bg-background/50 p-3"
          >
            <div className="min-w-0">
              <Link
                to={`/skills/${s.id}`}
                className="block truncate text-sm font-semibold hover:underline"
              >
                {s.name}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="truncate">
                  {s.category || "—"}
                </Badge>
                <Badge variant={info.variant}>{info.label}</Badge>
                <span className="text-xs text-muted-foreground">
                  decay: {Number(s.decay_score ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                disabled={disabled}
                onClick={() => onPractice(s.id)}
              >
                Practice
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full"
                disabled={disabled}
                onClick={() => onDelete(s.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

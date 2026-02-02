import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function formatDate(v) {
  if (!v) return "—"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString()
}

export default function SkillDetails({ skills }) {
  const { id } = useParams()
  const skillId = Number(id)

  const skill = useMemo(() => skills.find((s) => Number(s.id) === skillId), [skills, skillId])

  if (!skill) {
    return (
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Skill not found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            This skill is not in the current list. Go back to Skills and refresh.
          </div>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/skills">Back to Skills</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{skill.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Category: {skill.category || "—"}
          </p>
        </div>

        <Button asChild variant="secondary" className="rounded-full">
          <Link to="/skills">Back</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-background/60 backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(skill.created_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Last practiced</span>
              <span className="font-medium">{formatDate(skill.last_practiced_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Decay score</span>
              <span className="font-medium">{Number(skill.decay_score ?? 0)}</span>
            </div>

            <div className="mt-6 rounded-xl border bg-muted/30 p-4">
              <div className="text-sm font-semibold">Next upgrade</div>
              <div className="mt-1 text-sm text-muted-foreground">
                We will add “Notes”, “Questions”, “Resources”, and “Practice sessions history”
                on this page (requires new backend tables).
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border p-3 text-sm text-muted-foreground">
              Actions on this screen will be added after we wire “single-skill API fetch”
              and “notes/questions”.
            </div>
            <Button asChild className="w-full rounded-full">
              <Link to="/skills">Practice / Delete from Skills page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

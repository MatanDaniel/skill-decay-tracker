import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export default function Dashboard({ skills }) {
  const stats = useMemo(() => {
    const total = skills.length
    const avgDecay =
      total === 0 ? 0 : Math.round(skills.reduce((sum, s) => sum + (Number(s.decay_score) || 0), 0) / total)

    const highDecay = skills.filter((s) => (Number(s.decay_score) || 0) >= 70).length

    // simple buckets for a chart 
    const buckets = [
      { name: "0-19", count: 0 },
      { name: "20-39", count: 0 },
      { name: "40-59", count: 0 },
      { name: "60-79", count: 0 },
      { name: "80-100", count: 0 },
    ]

    for (const s of skills) {
      const d = clamp(Number(s.decay_score) || 0, 0, 100)
      if (d < 20) buckets[0].count++
      else if (d < 40) buckets[1].count++
      else if (d < 60) buckets[2].count++
      else if (d < 80) buckets[3].count++
      else buckets[4].count++
    }

    return { total, avgDecay, highDecay, buckets }
  }, [skills])

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total skills</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.total}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average decay</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.avgDecay}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">High decay (70+)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.highDecay}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decay distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.buckets}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

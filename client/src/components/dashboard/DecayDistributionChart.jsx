import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function bucketLabel(i) {
  const ranges = ["0-19", "20-39", "40-59", "60-79", "80-100"]
  return ranges[i] || "?"
}

export default function DecayDistributionChart({ skills }) {
  const data = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]
    for (const s of skills) {
      const v = Math.max(0, Math.min(100, Number(s.decay_score ?? 0)))
      const idx = Math.min(4, Math.floor(v / 20))
      buckets[idx]++
    }
    return buckets.map((count, i) => ({ range: bucketLabel(i), count }))
  }, [skills])

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="range" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

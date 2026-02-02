import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Flame, Layers, TrendingUp } from "lucide-react"

import DecayDistributionChart from "../components/dashboard/DecayDistributionChart"
import NextToPracticeTable from "../components/dashboard/NextToPracticeTable"

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <Card className="bg-background/60 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  )
}

export default function Dashboard({ skills, stats, onPractice, onDelete, disabled }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insights based on your practice history and decay score.
          </p>
        </div>

        <Button asChild className="rounded-full">
          <Link to="/skills">
            Manage skills <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total skills"
          value={stats.total}
          icon={Layers}
          hint="All skills currently tracked"
        />
        <StatCard
          title="Average decay"
          value={stats.avg}
          icon={TrendingUp}
          hint="0 = fresh, 100 = fully decayed"
        />
        <StatCard
          title="High decay (70+)"
          value={stats.high}
          icon={Flame}
          hint="Skills that need attention soon"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="bg-background/60 backdrop-blur lg:col-span-3">
          <CardHeader>
            <CardTitle>Decay distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DecayDistributionChart skills={skills} />
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle>Next to practice</CardTitle>
          </CardHeader>
          <CardContent>
            <NextToPracticeTable
              skills={stats.nextToPractice}
              onPractice={onPractice}
              onDelete={onDelete}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

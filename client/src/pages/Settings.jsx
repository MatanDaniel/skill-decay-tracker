import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          UI preferences and app options will live here.
        </p>
      </div>

      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Coming next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          We can add: theme toggle, decay model settings (MAX_DAYS), categories management,
          export/import, and backup.
        </CardContent>
      </Card>
    </div>
  )
}

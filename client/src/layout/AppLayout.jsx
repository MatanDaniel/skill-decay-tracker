import { Outlet } from "react-router-dom"
import TopNav from "./TopNav"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AppLayout({ error, onClearError, loading }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <TopNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6" onClick={onClearError} role="button">
            <Alert variant="destructive" className="cursor-pointer">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
            Loading data…
          </div>
        )}

        <Outlet />
      </main>
    </div>
  )
}

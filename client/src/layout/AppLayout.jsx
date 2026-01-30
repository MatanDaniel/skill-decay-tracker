import TopNav from "./TopNav"

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}

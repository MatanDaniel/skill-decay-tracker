import { Link, NavLink } from "react-router-dom"
import { BarChart3, ListChecks } from "lucide-react"

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition
   ${isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Skill Decay Tracker
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </span>
          </NavLink>
          <NavLink to="/skills" className={navLinkClass}>
            <span className="inline-flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Skills
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

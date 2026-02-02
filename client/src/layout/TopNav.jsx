import { NavLink } from "react-router-dom"
import { LayoutDashboard, ListChecks, BarChart3, Settings } from "lucide-react"

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
          "hover:bg-muted/60",
          isActive ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border bg-muted/30">
            <span className="text-sm font-semibold">SD</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Skill Decay Tracker</div>
            <div className="text-xs text-muted-foreground">Dashboard • Skills • Reports</div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/skills" icon={ListChecks} label="Skills" />
          <NavItem to="/reports" icon={BarChart3} label="Reports" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>
      </div>
    </header>
  )
}

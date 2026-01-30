import SkillForm from "../components/SkillForm"
import SkillList from "../components/SkillList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SkillsPage({
  skills,
  filteredSkills,
  disabled,
  loading,
  handleAdd,
  handleDelete,
  handlePractice,
  sortKey,
  sortDir,
  handleChangeSort,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add a skill</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillForm onAdd={handleAdd} disabled={disabled} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Your skills{" "}
            <span className="text-muted-foreground font-normal">
              ({filteredSkills.length}/{skills.length})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 sm:w-56"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            <SkillList
              skills={filteredSkills}
              onDelete={handleDelete}
              onPractice={handlePractice}
              disabled={disabled}
              sortKey={sortKey}
              sortDir={sortDir}
              onChangeSort={handleChangeSort}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

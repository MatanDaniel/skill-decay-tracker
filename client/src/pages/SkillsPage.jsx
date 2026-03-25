// React hooks for state and memoization
import { useMemo, useState } from "react";

// Components for adding and listing skills
import SkillForm from "../components/SkillForm";
import SkillList from "../components/SkillList";

// UI components (cards layout)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillsPage({
  skills,        // array of all skills from parent (App)
  loading,       // loading state for skills fetch
  disabled,      // disables buttons during actions
  onAdd,         // function to add a skill
  onDelete,      // function to delete a skill
  onPractice,    // function to mark skill as practiced
}) {

  // -------------------------
  // Local UI state
  // -------------------------

  // Text input for search filter
  const [search, setSearch] = useState("");

  // Category filter (dropdown)
  const [categoryFilter, setCategoryFilter] = useState("all");

  // -------------------------
  // Derive category list
  // -------------------------

  /*
    We extract unique categories from skills.
    Example:
      skills = [{category: "Backend"}, {category: "Frontend"}]

      → ["all", "Backend", "Frontend"]

    useMemo is used so this calculation only runs
    when "skills" changes (performance optimization).
  */
  const categories = useMemo(() => {
    const set = new Set();

    for (const s of skills) {
      if (s.category) set.add(s.category);
    }

    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [skills]);

  // -------------------------
  // Filter skills (search + category)
  // -------------------------

  /*
    This filters the list based on:
    - search text (name contains query)
    - selected category

    Example:
      search = "sql"
      → only skills with "sql" in name

      categoryFilter = "Backend"
      → only backend skills

    Again, useMemo prevents recalculating unnecessarily.
  */
  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();

    return skills.filter((s) => {
      const matchesName =
        !q || String(s.name ?? "").toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || String(s.category ?? "") === categoryFilter;

      return matchesName && matchesCategory;
    });
  }, [skills, search, categoryFilter]);

  // -------------------------
  // UI Rendering
  // -------------------------

  return (
    <div className="space-y-6">
      
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add skills, practice them, and keep the list clean.
        </p>
      </div>

      {/* -------------------------
          Add Skill Section (FULL WIDTH)
         ------------------------- */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Add a skill</CardTitle>
        </CardHeader>

        <CardContent>
          {/* 
            SkillForm handles:
            - input fields
            - validation
            - calling onAdd()
          */}
          <SkillForm onAdd={onAdd} disabled={disabled} />
        </CardContent>
      </Card>

      {/* -------------------------
          Skills Table Section (FULL WIDTH, BELOW)
         ------------------------- */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>
            Your skills{" "}
            {/* Show count: filtered / total */}
            <span className="font-normal text-muted-foreground">
              ({filteredSkills.length}/{skills.length})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>

          {/* -------------------------
              Filters (search + category)
             ------------------------- */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">

            {/* Search input */}
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Category dropdown */}
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 md:w-64"
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

          {/* -------------------------
              Skills List (table)
             ------------------------- */}

          {loading ? (
            // Show loading state
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            // Render table component
            <SkillList
              skills={filteredSkills}
              onDelete={onDelete}
              onPractice={onPractice}
              disabled={disabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
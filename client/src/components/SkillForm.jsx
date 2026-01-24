import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SkillForm({ onAdd, disabled }) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    await onAdd({ name, category })
    setName("")
    setCategory("")
  }

  const canSubmit = name.trim().length >= 2 && category.trim().length >= 2

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="skillName">Skill name</Label>
        <Input
          id="skillName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., React, SQL, System design"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="skillCategory">Category</Label>
        <Input
          id="skillCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Frontend, Backend, DevOps"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={disabled || !canSubmit}>
          Add skill
        </Button>
        <p className="text-sm text-muted-foreground">
          Min 2 chars per field.
        </p>
      </div>
    </form>
  )
}

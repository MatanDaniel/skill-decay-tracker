const express = require("express");
const router = express.Router();

const skillsController = require("../controllers/skills.controller");
const { validateCreateSkill } = require("../middleware/validate");

// GET /api/skills
router.get("/", skillsController.listSkills);

// GET /api/skills/:id
router.get("/:id", skillsController.getSkillById);

// POST /api/skills
router.post("/", validateCreateSkill, skillsController.createSkill);

// PUT /api/skills/:id
router.put("/:id", skillsController.updateSkill);

// DELETE /api/skills/:id
router.delete("/:id", skillsController.deleteSkill);

// PATCH /api/skills/:id/practice
router.patch("/:id/practice", skillsController.practiceSkill);

// NOTES (per skill)
// GET /api/skills/:id/notes
router.get("/:id/notes", skillsController.listNotesForSkill);

// POST /api/skills/:id/notes   body: { content: "..." }
router.post("/:id/notes", skillsController.createNoteForSkill);

// DELETE /api/skills/:id/notes/:noteId
router.delete("/:id/notes/:noteId", skillsController.deleteNoteForSkill);

router.get("/:id/progress-history", skillsController.getProgressHistoryForSkill);
router.post("/:id/progress-history", skillsController.addProgressHistoryForSkill);

module.exports = router;

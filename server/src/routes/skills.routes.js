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

module.exports = router;

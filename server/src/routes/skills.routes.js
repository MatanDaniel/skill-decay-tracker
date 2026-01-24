//Routes should only handle HTTP
//requests and responses.

const express = require("express");
const router = express.Router();

const {listSkills, createSkill, getSkillById,deleteSkill,updateSkill} = require("../controllers/skills.controller.js");
const { validateCreateSkill } = require("../middleware/validate.js");
const skillsController = require("../controllers/skills.controller");



// GET /skills
router.get("/", listSkills);
// GET /skills/:id
router.get("/:id", getSkillById);


// POST /skills
router.post("/", createSkill);
// Post /skills runs validateCreateSkill first, only if it passes, it calls createSkill
router.post("/", validateCreateSkill, createSkill);


router.delete("/:id", deleteSkill);
-

router.put("/:id", updateSkill); 
// When PUT /skills/123 is called, run updateSkill(req,res,next)

// Maps DELETE /skills/123 to deleteSkill controller
router.delete("/:id", deleteSkill);

// Maps PATCH /skills/123/practice to practiceSkill controller
router.patch("/:id/practice", skillsController.practiceSkill);


module.exports = router;

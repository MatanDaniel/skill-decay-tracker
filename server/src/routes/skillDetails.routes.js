const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/skillDetails.controller");

// Notes
router.get("/:id/notes", ctrl.listNotes);
router.post("/:id/notes", ctrl.createNote);
router.delete("/:id/notes/:noteId", ctrl.deleteNote);

// Questions
router.get("/:id/questions", ctrl.listQuestions);
router.post("/:id/questions", ctrl.createQuestion);
router.patch("/:id/questions/:questionId", ctrl.updateQuestion); // answer, edit question
router.delete("/:id/questions/:questionId", ctrl.deleteQuestion);

// Practice sessions
router.get("/:id/sessions", ctrl.listSessions);
router.post("/:id/sessions", ctrl.createSession);

module.exports = router;

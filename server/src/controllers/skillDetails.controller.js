const db = require("../db");

// ---------- Notes ----------
async function listNotes(req, res, next) {
  try {
    const { id } = req.params;
    const r = await db.query(
      `SELECT id, skill_id, content, created_at
       FROM skill_notes
       WHERE skill_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

async function createNote(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body || {};
    if (!content || typeof content !== "string" || content.trim().length < 2) {
      return res.status(400).json({ error: "content is required (min 2 chars)" });
    }

    const r = await db.query(
      `INSERT INTO skill_notes (skill_id, content, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, skill_id, content, created_at`,
      [id, content.trim()]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

async function deleteNote(req, res, next) {
  try {
    const { id, noteId } = req.params;
    const r = await db.query(
      `DELETE FROM skill_notes
       WHERE id = $1 AND skill_id = $2
       RETURNING id`,
      [noteId, id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Note not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

// ---------- Questions ----------
async function listQuestions(req, res, next) {
  try {
    const { id } = req.params;
    const r = await db.query(
      `SELECT id, skill_id, question, answer, created_at
       FROM skill_questions
       WHERE skill_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

async function createQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body || {};

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return res.status(400).json({ error: "question is required (min 3 chars)" });
    }

    const cleanAnswer = typeof answer === "string" ? answer.trim() : null;

    const r = await db.query(
      `INSERT INTO skill_questions (skill_id, question, answer, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, skill_id, question, answer, created_at`,
      [id, question.trim(), cleanAnswer]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { id, questionId } = req.params;
    const { question, answer } = req.body || {};

    const cleanQuestion = typeof question === "string" ? question.trim() : null;
    const cleanAnswer = typeof answer === "string" ? answer.trim() : null;

    if (cleanQuestion !== null && cleanQuestion.length < 3) {
      return res.status(400).json({ error: "question min 3 chars" });
    }

    const r = await db.query(
      `UPDATE skill_questions
       SET
         question = COALESCE($1, question),
         answer = COALESCE($2, answer)
       WHERE id = $3 AND skill_id = $4
       RETURNING id, skill_id, question, answer, created_at`,
      [cleanQuestion, cleanAnswer, questionId, id]
    );

    if (!r.rowCount) return res.status(404).json({ error: "Question not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const { id, questionId } = req.params;
    const r = await db.query(
      `DELETE FROM skill_questions
       WHERE id = $1 AND skill_id = $2
       RETURNING id`,
      [questionId, id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Question not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

// ---------- Practice Sessions ----------
async function listSessions(req, res, next) {
  try {
    const { id } = req.params;
    const r = await db.query(
      `SELECT id, skill_id, practiced_at, minutes
       FROM practice_sessions
       WHERE skill_id = $1
       ORDER BY practiced_at DESC`,
      [id]
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

async function createSession(req, res, next) {
  try {
    const { id } = req.params;
    const { minutes } = req.body || {};
    const m = Number(minutes);

    if (!Number.isInteger(m) || m <= 0) {
      return res.status(400).json({ error: "minutes must be a positive integer" });
    }

    const r = await db.query(
      `INSERT INTO practice_sessions (skill_id, practiced_at, minutes)
       VALUES ($1, NOW(), $2)
       RETURNING id, skill_id, practiced_at, minutes`,
      [id, m]
    );

    // Optional but recommended: keep skills.last_practiced_at in sync
    await db.query(
      `UPDATE skills SET last_practiced_at = NOW() WHERE id = $1`,
      [id]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listNotes,
  createNote,
  deleteNote,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listSessions,
  createSession,
};

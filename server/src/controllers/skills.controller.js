const db = require("../db");

// --------------------
// Config
// --------------------
const MAX_DAYS = 30; // After 30 days without practice, decay_score reaches 100 (fully decayed)

// --------------------
// Helper SQL
// --------------------
/**
 * decay_score = 0..100 based on time since last_practiced_at.
 * Uses $1 as MAX_DAYS in the query.
 *
 * Notes:
 * - EXTRACT(EPOCH FROM (NOW() - last_practiced_at)) gives seconds since last practice
 * - / 86400 converts seconds -> days
 * - / MAX_DAYS * 100 converts days -> percent decay
 * - ROUND makes it an integer-like number
 * - GREATEST(0, ...) clamps negatives (safety)
 * - LEAST(100, ...) clamps to 100 max
 */
function decayScoreSql(paramIndex) {
  // paramIndex lets us reuse the same expression in different queries ($1 or $2 etc.)
  return `
    LEAST(
      100,
      GREATEST(
        0,
        ROUND(
          (EXTRACT(EPOCH FROM (NOW() - last_practiced_at)) / 86400) / $${paramIndex} * 100
        )
      )
    )::int
  `;
}

/**
 * SQL for GET /skills (list).
 * Returns all skills plus computed decay_score.
 */
function getListSkillsSql() {
  return `
    SELECT
      id,
      name,
      category,
      created_at,
      last_practiced_at,
      ${decayScoreSql(1)} AS decay_score
    FROM skills
    ORDER BY id DESC
  `;
}

/**
 * SQL for GET /skills/:id (single).
 * Returns the skill plus computed decay_score.
 */
function getSkillByIdSql() {
  return `
    SELECT
      id,
      name,
      category,
      created_at,
      last_practiced_at,
      (
        CASE
          WHEN last_practiced_at IS NULL THEN 0
          ELSE LEAST(
            100,
            GREATEST(
              0,
              ROUND(
                (EXTRACT(EPOCH FROM (NOW() - last_practiced_at)) / 86400) / $2 * 100
              )
            )
          )
        END
      )::int AS decay_score
    FROM skills
    WHERE id = $1
  `;
}


// --------------------
// Controllers
// --------------------

// GET /skills
async function listSkills(req, res, next) {
  try {
    const result = await db.query(getListSkillsSql(), [MAX_DAYS]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST /skills
// Body: { "name": "SQL", "category": "backend" }
async function createSkill(req, res, next) {
  try {
    const { name, category } = req.body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name is required (non-empty string)" });
    }

    const cleanName = name.trim();
    const cleanCategory = typeof category === "string" ? category.trim() : null;

    const result = await db.query(
      `
      INSERT INTO skills (name, category, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, name, category, created_at, last_practiced_at
      `,
      [cleanName, cleanCategory]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Skill name already exists" });
    }
    next(err);
  }
}

// GET /skills/:id
async function getSkillById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query(getSkillByIdSql(), [id, MAX_DAYS]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /skills/:id  (my handler is PATCH-style behavior)
async function updateSkill(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category } = req.body || {};

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return res.status(400).json({ error: "name must be a string (min 2 chars)" });
    }

    if (category !== undefined && (typeof category !== "string" || category.trim().length < 2)) {
      return res.status(400).json({ error: "category must be a string (min 2 chars)" });
    }

    const cleanName = typeof name === "string" ? name.trim() : null;
    const cleanCategory = typeof category === "string" ? category.trim() : null;

    const result = await db.query(
      `
      UPDATE skills
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category)
      WHERE id = $3
      RETURNING id, name, category, created_at, last_practiced_at
      `,
      [cleanName, cleanCategory, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Skill name already exists" });
    }
    next(err);
  }
}

// DELETE /skills/:id
async function deleteSkill(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const result = await db.query("DELETE FROM skills WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// POST /skills/:id/practice  
async function practiceSkill(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      UPDATE skills
      SET last_practiced_at = NOW()
      WHERE id = $1
      RETURNING id, name, category, created_at, last_practiced_at
      `,
      [id]
    );

    if (!result.rowCount) return res.status(404).json({ error: "Skill not found" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSkills,
  createSkill,
  getSkillById,
  updateSkill,
  deleteSkill,
  practiceSkill,
};

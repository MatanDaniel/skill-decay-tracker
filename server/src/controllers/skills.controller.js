const db = require("../db");


//query DB → get rows → return rows to client.
async function listSkills(req, res, next) {
  try {
    //runs your SQL against Postgres, and passes MAX_DAYS as $1 in the query.
    const result = await db.query(getListSkillsSql(), [MAX_DAYS]);
    res.json(result.rows);//sends that array back to the frontend as JSON.
  } catch (err) {
    next(err);
  }
}

/**
 * POST /skills
 * Body: { "name": "SQL", "category": "backend" }
 * Creates a new skill and returns it.
*/
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
      RETURNING id, name, category, created_at
      `   ,
      [cleanName, cleanCategory]
    );
    
    // 201 = created
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // PostgreSQL unique violation (name is UNIQUE)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Skill name already exists" });
    }
    next(err);
  }
}

async function getSkillById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT id, name, category, created_at FROM skills WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error("Skill not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
async function deleteSkill(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const result = await db.query(
      "DELETE FROM skills WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error("Skill not found");
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function updateSkill(req, res, next) {          // Controller for updating a skill by id
  try {                                               // Start a try/catch so DB errors go to the error handler
    const { id } = req.params;                        // Take the ":id" from the URL (string)
    const { name, category } = req.body || {};        // Take fields from JSON body (safe if body is missing)

    // Basic validation (PATCH-style behavior with PUT)
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {  // If name was sent, it must be a valid string
      return res.status(400).json({ error: "name must be a string (min 2 chars)" });   // Return 400 with JSON error
    }

    if (category !== undefined && (typeof category !== "string" || category.trim().length < 2)) { // If category was sent, validate it
      return res.status(400).json({ error: "category must be a string (min 2 chars)" });          // Return 400 with JSON error
    }

    const cleanName = typeof name === "string" ? name.trim() : null;       // Trim name if provided, else null
    const cleanCategory = typeof category === "string" ? category.trim() : null; // Trim category if provided, else null

    const result = await db.query(                                          // Run a SQL query and help protect against SQL injection
      `
      UPDATE skills
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category)
      WHERE id = $3
      RETURNING id, name, category, created_at
      `,                                                                    // SQL: update only provided fields and return updated row
      [cleanName, cleanCategory, id]                                        // Bind values to $1, $2, $3
    );

    if (result.rows.length === 0) {                                         // If no row returned, id does not exist
      res.status(404);                                                     // Set status to 404
      throw new Error("Skill not found");                                   // Throw so your errorHandler returns JSON
    }

    res.json(result.rows[0]);                                              // Send back the updated skill row as JSON
  } catch (err) {                                                          // Catch any errors
    if (err.code === "23505") {                                            // Postgres unique constraint violation (duplicate name)
      return res.status(409).json({ error: "Skill name already exists" });  // Return 409 conflict as JSON
    }
    next(err);                                                             // Pass error to centralized errorHandler middleware
  }
}

async function deleteSkill(req, res, next) {                  // Handles DELETE /skills/:id
  try {                                                       // Start try/catch so errors go to error middleware
    const id = Number(req.params.id);                         // Convert URL param ":id" to a number

    if (!Number.isInteger(id) || id <= 0) {                   // Validate id is a positive integer
      return res.status(400).json({ error: "id must be a positive integer" }); // 400 = client sent bad id
    }

    const result = await db.query(                            // Run SQL query against Postgres
      "DELETE FROM skills WHERE id = $1 RETURNING id",         // Delete row, RETURNING tells us if it existed
      [id]                                                    // Bind id safely into $1
    );

    if (result.rows.length === 0) {                           // No returned row means nothing was deleted
      res.status(404);                                        // Set status to 404
      throw new Error("Skill not found");                      // Throw so your JSON error handler responds
    }

    return res.status(204).send();                            // 204 = success, no response body
  } catch (err) {                                             // Catch any errors from DB or logic
    next(err);                                                // Forward to errorHandler middleware
  }
}
async function practiceSkill(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE public.skills
       SET last_practiced_at = NOW()
       WHERE id = $1
       RETURNING id, name, category, created_at, last_practiced_at`,
      [id]
    );

    if (!result.rowCount) return res.status(404).json({ error: "Skill not found" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ----- Helper SQL -----

const MAX_DAYS = 30; // After 30 days without practice, decay_score reaches 100 (fully decayed)

function getListSkillsSql() {
  return `
    SELECT
      id, name, category, last_practiced_at,
      LEAST(
        100,
        GREATEST(
          0,
          ROUND(
            (EXTRACT(EPOCH FROM (NOW() - last_practiced_at)) / 86400) / $1 * 100
          )
        )
      )::int AS decay_score
    FROM skills
    ORDER BY id DESC
  `;
}
/**
 * ****getListSkillsSql:
 * Returns the SQL query used by GET /api/skills.
 * It returns all skills + a backend-computed decay_score (0..100).
 *
 * decay_score meaning:
 *   0   = practiced just now / very fresh
 *   100 = fully decayed (>= MAX_DAYS days since last_practiced_at)
 */

module.exports = {
  listSkills,
  createSkill,
  getSkillById,
  deleteSkill,
  updateSkill,
  deleteSkill,
  practiceSkill,
};

/// Role: creates express app
// The backend “entry point”.
//Starts Express
//Adds middleware (express.json())
//Connects routes (/api/skills, /api/...)
//Starts listening on a port
//Think of it as the “wiring” file.




require("dotenv").config();

const express = require("express");
const db = require("./db");
const skillsRoutes = require("./routes/skills.routes.js");
const { notFound, errorHandler } = require("./middleware/error.middleware.js");

const app = express();
app.use(express.json());
app.use("/api/skills", skillsRoutes);


// Simple health check and DB test endpoints
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/db-test", async (req, res, next) => {
  try {
    const result = await db.query("SELECT NOW() as now");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));



//The backend project structure:
/**
 * routes/
  skills.routes.js      → HTTP routing only
controllers/
  skills.controller.js  → DB + business logic
middleware/
  validate.js           → request validation
  error.middleware.js   → notFound + errorHandler

 */
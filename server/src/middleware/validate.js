function validateCreateSkill(req, res, next) {
  const { name, category } = req.body || {};

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "name must be a string (min 2 chars)" });
  }

  if (typeof category !== "string" || category.trim().length < 2) {
    return res.status(400).json({ error: "category must be a string (min 2 chars)" });
  }

  req.body.name = name.trim();
  req.body.category = category.trim();

  next();
}

module.exports = { validateCreateSkill };

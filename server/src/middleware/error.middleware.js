// the purpose of middleware is to catch errors from controllers 
// and send appropriate HTTP responses / JSON errors

// Runs when no route matched
// Runs when no route matched
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found: ${req.method} ${req.originalUrl}`));
}

// Central error handler (must have 4 params)
function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
}

module.exports = { notFound, errorHandler };


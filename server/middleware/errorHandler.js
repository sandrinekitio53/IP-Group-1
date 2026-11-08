// Runs when a request matches no route at all
exports.notFound = (req, res) => {
  res.status(404).json({ message: "Not found" });
};

// Runs when ANY middleware or route throws an error.
// Express recognises an error handler by its 4 parameters (err, req, res, next).
exports.errorHandler = (err, req, res, next) => {
  // If a reply is already half-sent, let Express close the connection
  if (res.headersSent) return next(err);

  // Pick the status code, falling back to 500 for anything unexpected
  let status = err.status || err.statusCode || 500;
  if (status < 400 || status > 599) status = 500;

  // Choose a SAFE message for the client. The real error never goes to the client.
  let message = "Something went wrong. Please try again.";
  if (err.type === "entity.too.large") {
    status = 413;
    message = "Request is too large.";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body.";
  } else if (status < 500) {
    message = "Bad request.";
  }

  // Full details stay in the server terminal only
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  } else {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${status} ${err.message}`);
  }

  res.status(status).json({ message });
};
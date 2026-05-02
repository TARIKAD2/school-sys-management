function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.expose ? err.message : err.message || "Server error";
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };


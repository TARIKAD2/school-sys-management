function formatZodError(error) {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

module.exports = { formatZodError };

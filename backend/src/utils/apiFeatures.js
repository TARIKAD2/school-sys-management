function parseSort(sort) {
  if (!sort) return { createdAt: -1 };
  // e.g. "name,-createdAt"
  const fields = String(sort)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sortObj = {};
  for (const f of fields) {
    if (f.startsWith("-")) sortObj[f.slice(1)] = -1;
    else sortObj[f] = 1;
  }
  return Object.keys(sortObj).length ? sortObj : { createdAt: -1 };
}

function parsePagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildSearchFilter({ q, fields }) {
  if (!q) return null;
  const rx = new RegExp(String(q).trim(), "i");
  return { $or: fields.map((f) => ({ [f]: rx })) };
}

module.exports = { parseSort, parsePagination, buildSearchFilter };


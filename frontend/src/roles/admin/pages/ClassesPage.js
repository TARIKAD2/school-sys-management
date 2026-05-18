import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

function sortToggle(current, field) {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return field;
  return field;
}

function SortHeader({ label, field, sort, setSort }) {
  const active = sort === field || sort === `-${field}`;
  const dir = sort === `-${field}` ? "desc" : "asc";
  return (
    <button
      type="button"
      className="btn btn-link p-0 text-decoration-none"
      onClick={() => setSort(sortToggle(sort, field))}
    >
      {label} {active ? <span className="text-muted small">({dir})</span> : null}
    </button>
  );
}

function ClassModal({ open, mode, item, teachers, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  const [form, setForm] = useState({ name: "", level: "", academicYear: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    if (item && (isEdit || isView)) {
      setForm({
        name: item.name || "",
        level: item.level || "",
        academicYear: item.academicYear || "",
      });
    } else {
      setForm({ name: "", level: "", academicYear: "" });
    }
  }, [open, item, isEdit, isView]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (isCreate) {
        await api.post("/classes", {
          name: form.name,
          level: form.level || undefined,
          academicYear: form.academicYear || undefined,
        });
      } else if (isEdit && item) {
        await api.put(`/classes/${item._id}`, {
          name: form.name,
          level: form.level || undefined,
          academicYear: form.academicYear || undefined,
        });
      }
      setSuccess("Saved successfully.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const title = isCreate ? "Add Class" : isEdit ? "Edit Class" : "View Class";

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error ? <div className="alert alert-danger">{error}</div> : null}
            {success ? <div className="alert alert-success">{success}</div> : null}

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Level</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Academic year</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.academicYear}
                  onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Close
            </button>
            {!isView ? (
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "view", item: null });

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (q.trim()) params.q = q.trim();
    return params;
  }, [q, page, limit, sort]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ data: classesData }, { data: teachersData }] = await Promise.all([
        api.get("/classes", { params: queryParams }),
        api.get("/teachers", { params: { limit: 200, sort: "name" } }),
      ]);
      setItems(classesData.items || []);
      setPages(classesData.pages || 1);
      setTotal(classesData.total || 0);
      setTeachers(teachersData.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  async function onDelete(item) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete class ${item?.name || ""}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/classes/${item._id}`);
      await load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert(err?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Classes</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", item: null })}>
          Add class
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-5">
              <input
                className="form-control"
                placeholder="Search by class name, level, academic year..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                name="class-search-query"
                autoComplete="off"
              />
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-5 d-flex gap-2 justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQ("");
                  setPage(1);
                  setSort("name");
                }}
              >
                Reset
              </button>
              <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading classes...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No classes found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Name" field="name" sort={sort} setSort={setSort} />
                    </th>
                    <th>
                      <SortHeader label="Level" field="level" sort={sort} setSort={setSort} />
                    </th>
                    <th>
                      <SortHeader label="Academic year" field="academicYear" sort={sort} setSort={setSort} />
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td>{c.level || <span className="text-muted">—</span>}</td>
                      <td>{c.academicYear || <span className="text-muted">—</span>}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setModal({ open: true, mode: "view", item: c })}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setModal({ open: true, mode: "edit", item: c })}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(c)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>

      <ClassModal
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        teachers={teachers}
        onClose={() => setModal({ open: false, mode: "view", item: null })}
        onSaved={async () => {
          await load();
          setModal({ open: false, mode: "view", item: null });
        }}
      />
    </div>
  );
}


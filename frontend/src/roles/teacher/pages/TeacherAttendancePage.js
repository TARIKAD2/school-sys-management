import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

function AttendanceModal({ open, classes, modules, students, onClose, onSaved }) {
  const [form, setForm] = useState({ date: "", classId: "", moduleId: "" });
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    setForm({ date: "", classId: "", moduleId: "" });
    setRecords([]);
  }, [open]);

  async function createAndSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const { data } = await api.post("/attendance", {
        date: form.date,
        classId: form.classId,
        moduleId: form.moduleId || undefined,
      });
      await api.put(`/attendance/${data.item._id}/records`, {
        records,
      });
      setSuccess("Attendance saved.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = useMemo(() => {
    if (!form.classId) return [];
    return students.filter((s) => s.class?._id === form.classId);
  }, [students, form.classId]);

  useEffect(() => {
    if (!form.classId) return;
    setRecords(
      filteredStudents.map((s) => ({
        studentId: s._id,
        status: "present",
        note: "",
      }))
    );
  }, [form.classId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Take attendance</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error ? <div className="alert alert-danger">{error}</div> : null}
            {success ? <div className="alert alert-success">{success}</div> : null}

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                  required
                >
                  <option value="">Select class...</option>
                  {classes.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Module (optional)</label>
                <select
                  className="form-select"
                  value={form.moduleId}
                  onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
                >
                  <option value="">(none)</option>
                  {modules.map((m) => (
                    <option value={m._id} key={m._id}>
                      {m.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!form.classId ? (
              <div className="alert alert-warning">Select a class to load students.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th style={{ width: 160 }}>Status</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr key={s._id}>
                        <td className="fw-semibold">{s.user?.name}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={records[idx]?.status || "present"}
                            onChange={(e) =>
                              setRecords((r) =>
                                r.map((it, i) => (i === idx ? { ...it, status: e.target.value } : it))
                              )
                            }
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={records[idx]?.note || ""}
                            onChange={(e) =>
                              setRecords((r) => r.map((it, i) => (i === idx ? { ...it, note: e.target.value } : it)))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Close
            </button>
            <button className="btn btn-primary" onClick={createAndSave} disabled={saving || !form.date || !form.classId}>
              {saving ? "Saving..." : "Save attendance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Show a panel of absent students across all attendance sheets */
function AbsentStudentsPanel({ items }) {
  const absentRows = useMemo(() => {
    const rows = [];
    for (const a of items) {
      for (const r of a.records || []) {
        if (r.status === "absent" || r.status === "late") {
          rows.push({
            id: `${a._id}:${r.student}`,
            date: a.date,
            className: a.class?.name,
            moduleCode: a.module?.code,
            studentId: r.student,
            status: r.status,
            note: r.note,
          });
        }
      }
    }
    return rows;
  }, [items]);

  if (!absentRows.length) return null;

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header">
        <h5 className="mb-0">Absent / Late Students from Your Lessons</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Module</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {absentRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : ""}</td>
                  <td className="fw-semibold">{r.className || <span className="text-muted">—</span>}</td>
                  <td>{r.moduleCode || <span className="text-muted">—</span>}</td>
                  <td>
                    {r.status === "absent" ? (
                      <span className="badge text-bg-danger">Absent</span>
                    ) : (
                      <span className="badge text-bg-warning">Late</span>
                    )}
                  </td>
                  <td>{r.note || <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TeacherAttendancePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);

  const [open, setOpen] = useState(false);

  const params = useMemo(() => ({ page, limit, sort }), [page, limit, sort]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ data: att }, { data: cls }, { data: mods }, { data: studs }] = await Promise.all([
        api.get("/attendance", { params }),
        api.get("/classes", { params: { limit: 200, sort: "name" } }),
        api.get("/modules", { params: { limit: 200, sort: "code" } }),
        api.get("/students", { params: { limit: 500, sort: "name" } }),
      ]);
      setItems(att.items || []);
      setPages(att.pages || 1);
      setTotal(att.total || 0);
      setClasses(cls.items || []);
      setModules(mods.items || []);
      setStudents(studs.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function onDelete(item) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete this attendance sheet?");
    if (!ok) return;
    await api.delete(`/attendance/${item._id}`);
    await load();
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Attendance</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Take attendance
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="-date">Date (newest)</option>
                <option value="date">Date (oldest)</option>
              </select>
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
                {[5, 10, 20].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-7 d-flex justify-content-end">
              <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading...</div> : null}
          {!loading && !items.length ? (
            <div className="alert alert-warning">No attendance records yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Module</th>
                    <th>Records</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a._id}>
                      <td>{a.date ? new Date(a.date).toLocaleDateString() : ""}</td>
                      <td className="fw-semibold">{a.class?.name}</td>
                      <td>{a.module?.code || <span className="text-muted">—</span>}</td>
                      <td>{a.records?.length || 0}</td>
                      <td className="text-end">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(a)}>
                          Delete
                        </button>
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

      {/* Absent / Late students panel */}
      <AbsentStudentsPanel items={items} />

      <AttendanceModal
        open={open}
        classes={classes}
        modules={modules}
        students={students}
        onClose={() => setOpen(false)}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

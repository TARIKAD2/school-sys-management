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

/** Mini horizontal bar chart for absent count per class */
function AbsenceBarChart({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6", "#a855f7",
  ];
  return (
    <div>
      {data.map((d, i) => (
        <div key={d.className} className="mb-2">
          <div className="d-flex justify-content-between mb-1">
            <span className="small fw-semibold">{d.className}</span>
            <span className="small text-muted">{d.count} absent</span>
          </div>
          <div
            style={{
              height: 18,
              borderRadius: 9,
              background: "#f3f4f6",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(d.count / max) * 100}%`,
                background: colors[i % colors.length],
                borderRadius: 9,
                transition: "width 0.6s ease",
                minWidth: d.count > 0 ? 18 : 0,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAttendancePage() {
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

  /** Compute absent count per class from loaded attendance items */
  const absentByClass = useMemo(() => {
    const map = {};
    for (const a of items) {
      const className = a.class?.name || "Unknown";
      if (!map[className]) map[className] = 0;
      for (const r of a.records || []) {
        if (r.status === "absent") map[className]++;
      }
    }
    return Object.entries(map)
      .map(([className, count]) => ({ className, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

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

      {/* Absent count per class chart */}
      {absentByClass.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Absent Students per Class (current page)</h5>
            <div className="row g-3 mb-3">
              {absentByClass.map((d) => (
                <div key={d.className} className="col-6 col-md-3">
                  <div className="card border-0 bg-light text-center py-3">
                    <div className="fs-3 fw-bold text-danger">{d.count}</div>
                    <div className="small text-muted">{d.className}</div>
                  </div>
                </div>
              ))}
            </div>
            <AbsenceBarChart data={absentByClass} />
          </div>
        </div>
      )}

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
                    <th>Absent</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => {
                    const absentCount = (a.records || []).filter((r) => r.status === "absent").length;
                    return (
                      <tr key={a._id}>
                        <td>{a.date ? new Date(a.date).toLocaleDateString() : ""}</td>
                        <td className="fw-semibold">{a.class?.name}</td>
                        <td>{a.module?.code || <span className="text-muted">—</span>}</td>
                        <td>{a.records?.length || 0}</td>
                        <td>
                          {absentCount > 0 ? (
                            <span className="badge text-bg-danger">{absentCount}</span>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(a)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>

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

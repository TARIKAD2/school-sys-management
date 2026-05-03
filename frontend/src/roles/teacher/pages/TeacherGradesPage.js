import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";
import { GraduationCap, Search, PlusCircle, CheckCircle, AlertCircle } from "lucide-react";

function GradeModal({ open, classes, onClose, onSaved }) {
  const [form, setForm] = useState({ classId: "", studentId: "", examId: "", score: 0, comment: "" });
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ classId: "", studentId: "", examId: "", score: 0, comment: "" });
    setError("");
    setSuccess("");
    setStudents([]);
    setExams([]);
  }, [open]);

  useEffect(() => {
    if (!form.classId) return;
    async function loadContext() {
      setLoadingContext(true);
      try {
        const [{ data: sData }, { data: eData }] = await Promise.all([
          api.get(`/students?classId=${form.classId}&limit=500`),
          api.get(`/exams?classId=${form.classId}&limit=500`),
        ]);
        setStudents(sData.items || []);
        setExams(eData.items || []);
      } catch (e) {
        setError("Failed to load class students/exams");
      } finally {
        setLoadingContext(false);
      }
    }
    loadContext();
  }, [form.classId]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    if (!form.studentId || !form.examId) {
      setError("Please select both student and exam.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/grades", {
        studentId: form.studentId,
        examId: form.examId,
        score: Number(form.score),
        comment: form.comment || undefined,
      });
      setSuccess("Grade saved successfully.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 p-4 pb-0">
            <h5 className="modal-title fw-bold">Record Student Grade</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-4">
            {error ? <div className="alert alert-danger rounded-3 small py-2 d-flex align-items-center gap-2"><AlertCircle size={14}/>{error}</div> : null}
            {success ? <div className="alert alert-success rounded-3 small py-2 d-flex align-items-center gap-2"><CheckCircle size={14}/>{success}</div> : null}
            
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-muted small fw-bold">1. SELECT CLASS</label>
                <select
                  className="form-select bg-light border-0 py-2 rounded-3"
                  value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, studentId: "", examId: "" }))}
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((c) => (
                    <option value={c._id} key={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-bold">2. STUDENT</label>
                <select
                  className="form-select bg-light border-0 py-2 rounded-3"
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  disabled={!form.classId || loadingContext}
                >
                  <option value="">{loadingContext ? "Loading..." : "Select student..."}</option>
                  {students.map((s) => (
                    <option value={s._id} key={s._id}>{s.user?.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-bold">3. EXAM</label>
                <select
                  className="form-select bg-light border-0 py-2 rounded-3"
                  value={form.examId}
                  onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}
                  disabled={!form.classId || loadingContext}
                >
                  <option value="">{loadingContext ? "Loading..." : "Select exam..."}</option>
                  {exams.map((e) => (
                    <option value={e._id} key={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-bold">SCORE (0-100)</label>
                <input
                  type="number"
                  className="form-control bg-light border-0 py-2 rounded-3 fw-bold text-primary"
                  value={form.score}
                  onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                  min={0} max={100} required
                />
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label text-muted small fw-bold">COMMENT</label>
                <input
                  className="form-control bg-light border-0 py-2 rounded-3"
                  placeholder="Feedback for the student..."
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 p-4 pt-0">
            <button className="btn btn-light px-4 rounded-pill fw-semibold" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary px-4 rounded-pill fw-semibold shadow-sm" onClick={save} disabled={saving || !form.studentId || !form.examId}>
              {saving ? "Saving..." : "Save Grade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherGradesPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);

  const params = useMemo(() => ({ page, limit: 10, sort }), [page, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: grades }, { data: cls }] = await Promise.all([
        api.get("/grades", { params }),
        api.get("/classes", { params: { limit: 200, sort: "name" } }),
      ]);
      setItems(grades.items || []);
      setPages(grades.pages || 1);
      setClasses(cls.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(item) {
    if (!window.confirm("Delete this grade record?")) return;
    try {
      await api.delete(`/grades/${item._id}`);
      await load();
    } catch (e) {
      alert("Delete failed.");
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center gap-2 mb-0">
            <GraduationCap className="text-primary" /> Student Grades
          </h3>
          <p className="text-muted small mb-0">Manage and record academic performance</p>
        </div>
        <button className="btn btn-primary px-4 rounded-pill shadow-sm d-flex align-items-center gap-2 fw-semibold" onClick={() => setOpen(true)}>
          <PlusCircle size={18} /> Add Grade
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3">
              <div className="input-group input-group-sm bg-light rounded-3 px-2">
                <span className="input-group-text bg-transparent border-0"><Search size={14} className="text-muted"/></span>
                <select className="form-select bg-transparent border-0" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-3">{error}</div>}
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="border-0 rounded-start">Student</th>
                  <th className="border-0">Exam / Module</th>
                  <th className="border-0 text-center">Score</th>
                  <th className="border-0">Date</th>
                  <th className="border-0 text-end rounded-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No grade records found.</td></tr>
                ) : items.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <div className="fw-bold text-dark">{g.student?.user?.name}</div>
                      <div className="text-[11px] text-muted">{g.student?.studentId}</div>
                    </td>
                    <td>
                      <div className="fw-semibold small">{g.exam?.title}</div>
                      <div className="text-[10px] text-primary bg-primary bg-opacity-10 d-inline-block px-1 rounded">{g.exam?.module?.code}</div>
                    </td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-3 ${g.score >= 50 ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'}`}>
                        {g.score} / 100
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm border-0 rounded-circle p-2 " onClick={() => onDelete(g)}>
                        <AlertCircle size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>

      <GradeModal open={open} classes={classes} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}


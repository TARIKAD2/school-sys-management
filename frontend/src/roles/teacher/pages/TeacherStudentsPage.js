import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

export default function TeacherStudentsPage() {
  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);

  const params = useMemo(() => {
    const p = { page, limit, sort };
    if (q.trim()) p.q = q.trim();
    if (classId) p.classId = classId;
    return p;
  }, [q, classId, page, limit, sort]);

  // Load classes once
  useEffect(() => {
    api.get("/classes?limit=200&sort=name").then(({ data }) => {
      setClasses(data.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/students", { params });
        if (!mounted) return;
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Students</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" style={{ width: 160 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name">Name (A→Z)</option>
            <option value="-name">Name (Z→A)</option>
            <option value="studentId">Student ID (A→Z)</option>
            <option value="-studentId">Student ID (Z→A)</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search students..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
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
                {[5, 10, 20, 50].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3 d-flex gap-2 justify-content-end">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setQ(""); setClassId(""); setPage(1); }}
              >
                Reset
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No students found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s._id}>
                      <td className="fw-semibold">{s.user?.name}</td>
                      <td>{s.user?.email}</td>
                      <td>{s.studentId}</td>
                      <td>{s.class?.name || <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
}

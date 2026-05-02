import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TeacherSchedulePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = { page, limit, sort: "dayOfWeek,startTime" };
    if (dayOfWeek !== "") p.dayOfWeek = Number(dayOfWeek);
    return p;
  }, [page, limit, dayOfWeek]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/timetable", { params });
        if (!mounted) return;
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load schedule");
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
      <h3 className="mb-3">My Schedule</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <select className="form-select" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                <option value="">All days</option>
                {DAYS.map((d, i) => (
                  <option value={i} key={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-end">
              <button className="btn btn-outline-primary" onClick={() => setPage(1)} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading schedule...</div> : null}
          {!loading && !items.length ? (
            <div className="alert alert-warning">No schedule entries found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Class</th>
                    <th>Module</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t._id}>
                      <td>{DAYS[t.dayOfWeek] || t.dayOfWeek}</td>
                      <td>
                        {t.startTime} - {t.endTime}
                      </td>
                      <td className="fw-semibold">{t.class?.name}</td>
                      <td>{t.module?.code || <span className="text-muted">—</span>}</td>
                      <td>{t.room || <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
          <div className="text-muted small mt-2">Total: {total}</div>
        </div>
      </div>
    </div>
  );
}


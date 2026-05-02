import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [students, teachers, classes, modules, exams, recent] = await Promise.all([
          api.get("/students?limit=1"),
          api.get("/teachers?limit=1"),
          api.get("/classes?limit=1"),
          api.get("/modules?limit=1"),
          api.get("/exams?limit=1"),
          api.get("/exams?limit=5&sort=-date"),
        ]);
        if (mounted) {
          setStats({
            students: students.data.total,
            teachers: teachers.data.total,
            classes: classes.data.total,
            modules: modules.data.total,
            exams: exams.data.total,
          });
          setRecentExams(recent.data.items || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Admin Dashboard</h3>
        <Link to="/admin/attendance" className="btn btn-primary d-flex align-items-center gap-2">
          Add Absence
        </Link>
      </div>
      {loading ? <div className="alert alert-info">Loading statistics...</div> : null}
      {stats ? (
        <div className="row g-3">
          {[
            ["Students", stats.students],
            ["Teachers", stats.teachers],
            ["Classes", stats.classes],
            ["Modules", stats.modules],
            ["Exams", stats.exams],
          ].map(([label, value]) => (
            <div className="col-12 col-sm-6 col-lg-3" key={label}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">{label}</div>
                  <div className="fs-3 fw-bold">{value}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="fw-semibold mb-2">Upcoming Exams</div>
                {!recentExams.length ? (
                  <div className="text-muted small">No exams scheduled.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {recentExams.map((e) => (
                      <li className="list-group-item px-0" key={e._id}>
                        <div className="fw-semibold">{e.title}</div>
                        <div className="small text-muted">
                          {e.class?.name || "Class"} - {e.module?.code || "Module"} -{" "}
                          {e.date ? new Date(e.date).toLocaleString() : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="fw-semibold mb-2">System Health</div>
                <div className="small">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span>Student/Teacher ratio</span>
                    <span className="fw-semibold">
                      {stats.teachers ? (stats.students / stats.teachers).toFixed(2) : "N/A"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span>Modules per class</span>
                    <span className="fw-semibold">
                      {stats.classes ? (stats.modules / stats.classes).toFixed(2) : "N/A"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Exams per module</span>
                    <span className="fw-semibold">
                      {stats.modules ? (stats.exams / stats.modules).toFixed(2) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


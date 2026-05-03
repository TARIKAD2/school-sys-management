import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Activity, TrendingUp, UserCheck, Users } from "lucide-react";

const PIE_COLORS = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545"];

const ATTENDANCE_DATA = [
  { name: "Mon", rate: 92 }, { name: "Tue", rate: 95 }, { name: "Wed", rate: 88 },
  { name: "Thu", rate: 90 }, { name: "Fri", rate: 85 },
];
const GRADE_DIST = [
  { name: "A (90-100)", value: 25 }, { name: "B (80-89)", value: 45 },
  { name: "C (70-79)", value: 20 }, { name: "D (60-69)", value: 8 }, { name: "F (<60)", value: 2 },
];
const MODULE_PERF = [
  { name: "Physics", avg: 78 }, { name: "Maths", avg: 85 },
  { name: "Biology", avg: 72 }, { name: "Chemistry", avg: 88 }, { name: "Computer Sc.", avg: 94 },
];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [stuRes, teaRes, attRes] = await Promise.all([
          api.get("/students?limit=1"),
          api.get("/teachers?limit=1"),
          api.get("/attendance?limit=1"),
        ]);
        setStats({
          students: stuRes.data.total ?? (stuRes.data.data?.length ?? 0),
          teachers: teaRes.data.total ?? (teaRes.data.data?.length ?? 0),
          attendance: attRes.data.total ?? (attRes.data.items?.length ?? 0),
        });
      } catch (err) {
        console.error(err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary mb-3" />
      <div className="text-muted">Crunching numbers…</div>
    </div>
  );

  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">System Analytics</h2>
        <p className="text-muted mb-0">Real-time performance metrics and institutional insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Enrollment", value: stats.students, icon: <Users size={22} />, color: "primary" },
          { label: "Faculty Staff", value: stats.teachers, icon: <UserCheck size={22} />, color: "success" },
          { label: "Attendance Records", value: stats.attendance, icon: <Activity size={22} />, color: "info" },
          { label: "Avg. Performance", value: "84.2%", icon: <TrendingUp size={22} />, color: "warning" },
        ].map((s, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-4 bg-white h-100">
              <div className={`text-${s.color} mb-2`}>{s.icon}</div>
              <div className="small text-muted mb-1">{s.label}</div>
              <div className="h3 fw-bold mb-0">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        {/* Attendance Area Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <h6 className="fw-bold mb-4">Weekly Attendance Trend (%)</h6>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ATTENDANCE_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="rate" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Grade Distribution Pie */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <h6 className="fw-bold mb-4">Grade Distribution</h6>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={GRADE_DIST} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {GRADE_DIST.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2">
              {GRADE_DIST.map((item, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2 small">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i] }} />
                    {item.name}
                  </div>
                  <div className="fw-bold small">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Performance Bar */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 bg-white">
            <h6 className="fw-bold mb-4">Average Performance by Module</h6>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODULE_PERF} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="avg" fill="#0d6efd" radius={[6, 6, 0, 0]} barSize={36} name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

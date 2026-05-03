import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import { Users, BookOpen, MessageSquare, ArrowUpRight, Clock } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [students, classes, demands] = await Promise.all([
          api.get("/students?limit=1"),
          api.get("/classes?limit=1"),
          api.get("/demands?limit=1"),
        ]);
        if (mounted) {
          setStats({
            students: students.data.total || 0,
            classes: classes.data.total || 0,
            demands: demands.data.total || 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { label: "Total Students", value: stats?.students, icon: Users, color: "primary", trend: "+12% this month" },
    { label: "Active Classes", value: stats?.classes, icon: BookOpen, color: "success", trend: "0" },
    { label: "Admin Demands", value: stats?.demands, icon: MessageSquare, color: "warning", trend: "5 new today" },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-0 text-dark">Welcome back, {user?.name}</h2>
          <p className="text-muted mb-0">System Secretary | Administrator Portal</p>
        </div>
        <div className="d-flex gap-2 bg-white p-2 rounded-4 shadow-sm border px-3">
          <Clock size={18} className="text-primary" />
          <span className="fw-bold small">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {cards.map((card, idx) => (
          <div className="col-12 col-md-4" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-hover">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className={`p-3 rounded-4 bg-${card.color} bg-opacity-10 text-${card.color}`}>
                    <card.icon size={24} />
                  </div>
                   <div className={`px-2 py-1 rounded-pill smaller bg-${card.color} bg-opacity-10 text-${card.color} fw-bold`} style={{ fontSize: '10px' }}>
                     {card.trend}
                   </div>
                </div>
                <div className="text-muted small fw-bold text-uppercase tracking-wider">{card.label}</div>
                <div className="d-flex align-items-baseline gap-2">
                  <h2 className="fw-bold mb-0 mt-1">{loading ? '...' : card.value}</h2>
                  <ArrowUpRight size={14} className="text-success" />
                </div>
              </div>
              <div className={`bg-${card.color}`} style={{ height: '4px', opacity: 0.3 }}></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import api from "../../../api/client";
import { useSocket } from "../../../context/SocketContext";
import { Bell } from "lucide-react";

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const socket = useSocket();

  const loadApiData = useCallback(async () => {
    let mounted = true;
    try {
      const [students, exams, attendance, grades, schedule, notifs] = await Promise.all([
        api.get("/students?limit=1"),
        api.get("/exams?limit=1"),
        api.get("/attendance?limit=1"),
        api.get("/grades?limit=1"),
        api.get("/timetable?limit=1"),
        api.get("/notifications?limit=5")
      ]);
      
      if (mounted) {
        setStats({
          students: students.data.total || 0,
          exams: exams.data.total || 0,
          attendanceSheets: attendance.data.total || 0,
          grades: grades.data.total || 0,
          scheduleSlots: schedule.data.total || 0,
        });
        setRecentNotifications(notifs.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => mounted = false;
  }, []);

  useEffect(() => {
    const cleanup = loadApiData();
    // Return early if cleanup is not a function (i.e. async function returned promise)
  }, [loadApiData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotif = (newNotif) => {
      setRecentNotifications(prev => {
        // Prevent duplication locally
        if (prev.find(p => p._id === newNotif._id)) return prev;
        const state = [newNotif, ...prev];
        return state.slice(0, 5); // Keep top 5
      });
    };

    socket.on("notification", handleNewNotif);
    
    // Automatically refetch latest notifications & stats if socket reconnects
    socket.on("connect", loadApiData);
    
    // Auto-resync when a message is read in another component
    socket.on("sync_notifications", loadApiData);

    return () => {
      socket.off("notification", handleNewNotif);
      socket.off("connect", loadApiData);
      socket.off("sync_notifications", loadApiData);
    };
  }, [socket, loadApiData]);

  return (
    <div className="container-fluid pb-5">
      <h3 className="fw-bold mb-4">Teacher Dashboard</h3>
      {loading ? <div className="alert alert-info">Loading dashboard...</div> : null}
      
      <div className="row g-4">
        {/* Statistics Grid */}
        <div className="col-12 col-xl-8">
          <div className="row g-3">
            {stats
              ? [
                  ["Students", stats.students],
                  ["Exams", stats.exams],
                  ["Attendance", stats.attendanceSheets],
                  ["Grades", stats.grades],
                  ["Schedule", stats.scheduleSlots],
                ].map(([label, value]) => (
                  <div className="col-12 col-sm-6 col-md-4" key={label}>
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body p-4 text-center">
                        <div className="text-muted small fw-semibold text-uppercase mb-2">{label}</div>
                        <div className="fs-2 fw-bold text-primary">{value}</div>
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-2">
                  <Bell className="text-warning" size={20} />
                  <h5 className="fw-bold mb-0">Notifications</h5>
                </div>
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 rounded-pill">Live</span>
              </div>
              
              <div className="vstack gap-3">
                {recentNotifications.map(n => (
                  <div key={n._id} className={`p-3 rounded-4 border-start border-4 ${n.isRead ? 'bg-light border-secondary text-muted' : 'bg-white border-primary shadow-sm'}`}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="fw-bold small">{n.title}</div>
                      <div className="text-[10px] opacity-75">{new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="small opacity-75 line-clamp-2">{n.message}</div>
                  </div>
                ))}
                {recentNotifications.length === 0 && (
                  <div className="text-center py-5 opacity-50">
                    <Bell size={40} className="mb-2" />
                    <div className="small">No notifications yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

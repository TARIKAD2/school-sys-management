import React, { useEffect, useState, useCallback } from "react";
import api from "../../../api/client";
import { User, BookOpen, Bell } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const socket = useSocket();

  const loadApiData = useCallback(async () => {
    let mounted = true;
    try {
      const [
        { data: sData }, 
        { data: nData }
      ] = await Promise.all([
        api.get("/students/me"),
        api.get("/notifications?limit=5")
      ]);
      
      if (mounted) {
        setStudent(sData.student);
        setRecentNotifications(nData.data || []);
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
        // Prevent duplication locally just in case
        if (prev.find(p => p._id === newNotif._id)) return prev;
        const state = [newNotif, ...prev];
        return state.slice(0, 5); // Keep top 5
      });
    };

    socket.on("notification", handleNewNotif);
    
    // Automatically refetch latest notifications if socket reconnects
    socket.on("connect", loadApiData);
    
    // Auto-resync when a message is read in another component
    socket.on("sync_notifications", loadApiData);

    return () => {
      socket.off("notification", handleNewNotif);
      socket.off("connect", loadApiData);
      socket.off("sync_notifications", loadApiData);
    };
  }, [socket, loadApiData]);

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="container-fluid pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Student Dashboard</h3>
        <span className="text-muted small">Academic Year: {student?.class?.academicYear}</span>
      </div>

      <div className="row g-4">
        {/* Profile & Class Info */}
        <div className="col-12 col-xl-8">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <User className="text-primary" size={24} />
                    </div>
                    <h5 className="fw-bold mb-0">My Profile</h5>
                  </div>
                  <div className="mb-1 fw-semibold">{student?.user?.name}</div>
                  <div className="text-muted small mb-2">{student?.user?.email}</div>
                  <div className="badge bg-light text-primary border">{student?.studentId}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                      <BookOpen className="text-success" size={24} />
                    </div>
                    <h5 className="fw-bold mb-0">Class Information</h5>
                  </div>
                  <div className="mb-1 fw-semibold">{student?.class?.name || "Not Assigned"}</div>
                  <div className="text-muted small">Level: {student?.class?.level}</div>
                </div>
              </div>
            </div>
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
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 rounded-pill">New</span>
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
              <button className="btn btn-light btn-sm w-100 mt-4 text-primary fw-semibold">View All Notifications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


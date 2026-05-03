import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import MobileHeader from "../../components/mobile/MobileHeader";
import MobileSidebar from "../../components/mobile/MobileSidebar";
import BottomNav from "../../components/mobile/BottomNav";
import { Calendar, Users, BookOpen, ClipboardList, MessageSquare, Laptop, FileText } from "lucide-react";

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setMobileSidebarOpen(!isMobileSidebarOpen);
  const closeSidebar = () => setMobileSidebarOpen(false);

  const menuLinks = [
    { to: "/teacher/schedule", label: "Schedule", icon: Calendar },
    { type: 'header', label: 'Shortcuts' },
    { to: "/teacher/students", label: "Students", icon: Users },
    { to: "/teacher/exams", label: "Exams", icon: BookOpen },
    { to: "/teacher/attendance", label: "Attendance", icon: Calendar },
    { to: "/teacher/grades", label: "Grades", icon: ClipboardList },
    { type: 'header', label: 'Messages & Resources' },
    { to: "/teacher/messages", label: "Messages", icon: MessageSquare },
    { to: "/teacher/elearning", label: "E-Learning", icon: Laptop },
    { to: "/teacher/documents", label: "Documents", icon: FileText }
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", position: "relative" }}>
      
      {/* Mobile-Only Overlays & Navigation */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={closeSidebar} 
        links={menuLinks} 
        roleTitle="Teacher Panel" 
      />
      <MobileHeader onMenuClick={toggleSidebar} title="Teacher Portal" />
      <BottomNav onMenuClick={toggleSidebar} />

      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside 
        className="border-end bg-light d-none d-md-block shadow-sm"
        style={{ width: 260, position: 'relative', height: '100vh', left: 0, top: 0 }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold fs-5">Teacher Panel</div>
            <div className="small text-muted">{user?.email}</div>
          </div>
        </div>
        <nav className="p-2 py-3" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          <NavLink className="nav-link" to="/teacher/dashboard">
            Dashboard
          </NavLink>
          {menuLinks.map((link, idx) => (
            link.type === 'header' ? (
              <div key={idx} className="text-uppercase small text-muted mt-4 px-3 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                {link.label}
              </div>
            ) : (
              <NavLink key={idx} className="nav-link" to={link.to}>
                {link.label}
              </NavLink>
            )
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 overflow-hidden pb-16 md:pb-0 pt-14 md:pt-0">
        <header className="border-bottom bg-white shadow-sm sticky-top d-none d-md-block">
          <div className="container-fluid py-2 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="fw-semibold">Professional School Management</div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <NotificationBell />
              <button className="btn btn-outline-danger btn-sm px-3" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="container-fluid py-4 h-100" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import MobileHeader from "../../components/mobile/MobileHeader";
import MobileSidebar from "../../components/mobile/MobileSidebar";
import BottomNav from "../../components/mobile/BottomNav";
import { Calendar, Users, DollarSign, BookOpen, MessageSquare, ClipboardList } from "lucide-react";

export default function SecretaryLayout() {
  const { user, logout } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setMobileSidebarOpen(!isMobileSidebarOpen);
  const closeSidebar = () => setMobileSidebarOpen(false);

  const menuLinks = [
    { type: 'header', label: 'Management' },
    { to: "/secretary/attendance", label: "Attendance", icon: Calendar },
    { to: "/secretary/finance", label: "Finance", icon: DollarSign },
    { to: "/secretary/students", label: "Students", icon: Users },
    { to: "/secretary/teachers", label: "Teachers", icon: Users },
    { to: "/secretary/planning", label: "Planning", icon: ClipboardList },
    { to: "/secretary/exams", label: "Exams", icon: BookOpen },
    { type: 'header', label: 'Communication' },
    { to: "/secretary/messaging", label: "Messaging", icon: MessageSquare }
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", position: "relative" }}>
      
      {/* Mobile-Only Overlays & Navigation */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={closeSidebar} 
        links={menuLinks} 
        roleTitle="Secretary Panel" 
      />
      <MobileHeader onMenuClick={toggleSidebar} title="Secretary Portal" />
      <BottomNav onMenuClick={toggleSidebar} />

      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside 
        className="border-end bg-light d-none d-md-block shadow-sm"
        style={{ width: 260, position: 'relative', height: '100vh', left: 0, top: 0 }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold fs-5">Secretary Panel</div>
            <div className="small text-muted">{user?.email}</div>
          </div>
        </div>
        <nav className="p-2 py-3">
          <NavLink className="nav-link" to="/secretary/dashboard">
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

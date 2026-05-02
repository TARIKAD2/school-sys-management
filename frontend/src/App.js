import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./roles/admin/AdminLayout";
import DocumentCenterPage from "./pages/DocumentCenterPage";
import TeacherLayout from "./roles/teacher/TeacherLayout";
import StudentLayout from "./roles/student/StudentLayout";
import AdminDashboard from "./roles/admin/pages/AdminDashboard";
import StudentsPage from "./roles/admin/pages/StudentsPage";
import TeachersPage from "./roles/admin/pages/TeachersPage";
import ClassesPage from "./roles/admin/pages/ClassesPage";
import ModulesPage from "./roles/admin/pages/ModulesPage";
import ExamsPage from "./roles/admin/pages/ExamsPage";
import TimetablePage from "./roles/admin/pages/TimetablePage";
import ReportsPage from "./roles/admin/pages/ReportsPage";
import AdminAttendancePage from "./roles/admin/pages/AdminAttendancePage";
import AdminPaymentsPage from "./roles/admin/pages/AdminPaymentsPage";
import AdminAnalyticsPage from "./roles/admin/pages/AdminAnalyticsPage";
import AdminCalendarPage from "./roles/admin/pages/AdminCalendarPage";
import TeacherDashboard from "./roles/teacher/pages/TeacherDashboard";
import TeacherSchedulePage from "./roles/teacher/pages/TeacherSchedulePage";
import StudentDashboard from "./roles/student/pages/StudentDashboard";
import TeacherStudentsPage from "./roles/teacher/pages/TeacherStudentsPage";
import TeacherExamsPage from "./roles/teacher/pages/TeacherExamsPage";
import TeacherAttendancePage from "./roles/teacher/pages/TeacherAttendancePage";
import TeacherGradesPage from "./roles/teacher/pages/TeacherGradesPage";
import TeacherMessagesPage from "./roles/teacher/pages/TeacherMessagesPage";
import TeacherELearningPage from "./roles/teacher/pages/TeacherELearningPage";
import StudentExamsPage from "./roles/student/pages/StudentExamsPage";
import StudentGradesPage from "./roles/student/pages/StudentGradesPage";
import StudentAbsencesPage from "./roles/student/pages/StudentAbsencesPage";
import StudentProfilePage from "./roles/student/pages/StudentProfilePage";
import StudentTimetablePage from "./roles/student/pages/StudentTimetablePage";
import StudentMessagesPage from "./roles/student/pages/StudentMessagesPage";
import StudentPaymentsPage from "./roles/student/pages/StudentPaymentsPage";
import StudentELearningPage from "./roles/student/pages/StudentELearningPage";
import SecretaryLayout from "./roles/secretary/SecretaryLayout";
import SecretaryDashboard from "./roles/secretary/pages/SecretaryDashboard";
import SecretaryAttendancePage from "./roles/secretary/pages/SecretaryAttendancePage";
import SecretaryDemandsPage from "./roles/secretary/pages/SecretaryDemandsPage";
import SecretaryFinancePage from "./roles/secretary/pages/SecretaryFinancePage";

function RoleHomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === "secretary") return <Navigate to="/secretary/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="modules" element={<ModulesPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
               <Route path="payments" element={<AdminPaymentsPage />} />
               <Route path="analytics" element={<AdminAnalyticsPage />} />
               <Route path="calendar" element={<AdminCalendarPage />} />
               <Route path="documents" element={<DocumentCenterPage />} />
               <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="schedule" element={<TeacherSchedulePage />} />
              <Route path="students" element={<TeacherStudentsPage />} />
              <Route path="exams" element={<TeacherExamsPage />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
               <Route path="grades" element={<TeacherGradesPage />} />
               <Route path="messages" element={<TeacherMessagesPage />} />
               <Route path="elearning" element={<TeacherELearningPage />} />
               <Route path="documents" element={<DocumentCenterPage />} />
             </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
              <Route path="exams" element={<StudentExamsPage />} />
              <Route path="grades" element={<StudentGradesPage />} />
              <Route path="absences" element={<StudentAbsencesPage />} />
               <Route path="messages" element={<StudentMessagesPage />} />
               <Route path="payments" element={<StudentPaymentsPage />} />
               <Route path="elearning" element={<StudentELearningPage />} />
               <Route path="documents" element={<DocumentCenterPage />} />
               <Route path="profile" element={<StudentProfilePage />} />
             </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["secretary"]} />}>
            <Route path="/secretary" element={<SecretaryLayout />}>
              <Route path="dashboard" element={<SecretaryDashboard />} />
              <Route path="attendance" element={<SecretaryAttendancePage />} />
              <Route path="demands" element={<SecretaryDemandsPage />} />
              <Route path="finance" element={<SecretaryFinancePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

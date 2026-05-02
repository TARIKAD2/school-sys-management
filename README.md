<<<<<<< HEAD
# 🏫 Bright Future Academy - Professional School Management System

A premium, full-stack MERN (MongoDB, Express, React, Node) application designed for modern educational institutions. This system provides a unified, real-time platform for Administrators, Teachers, Students, and Secretaries to manage the entire academic and financial lifecycle.

---

## 🚀 Quick Start (Docker)

The fastest way to get the system running is using Docker Compose.

1. **Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
2. **Setup Environment**:
   ```powershell
   copy .env.example .env
   ```
3. **Launch**:
   ```powershell
   docker-compose up --build
   ```
4. **Access**:
   - Frontend: `http://localhost:3000`
   - Backend Health: `http://localhost:5000/api/health`

---

## 🏗️ System Architecture & Features

The system is built on a modular architecture with real-time capabilities and a high-end SaaS aesthetic.

### 🧩 Core Modules
- **💳 Payment & Billing**: Full tuition management. Admins generate invoices; students track payments and download receipts.
- **📚 E-Learning Hub**: Digital classroom where teachers upload lessons and assignments, and students submit work for grading.
- **📊 Advanced Analytics**: Real-time performance tracking using dynamic charts (Area, Pie, Bar) for attendance and grades.
- **📢 Real-time Notifications**: Instant alerts via **WebSockets** for messages, new grades, and administrative demands.
- **📅 Events & Calendar**: A shared school-wide calendar for scheduling exams, holidays, and meetings.
- **🧾 Document Management**: Secure vault for student certificates, staff contracts, and administrative records.

### 🏛️ Role-Based Workflows
- **Admin**: Oversight of all metrics, financial management, staff/student lifecycle, and institutional settings.
- **Teacher**: Lesson planning, assignment grading, attendance tracking, and student performance analysis.
- **Secretary**: Administrative registration, messaging "Demands" to students/teachers, and document handling.
- **Student**: Personal academic portal for lessons, grades, payments, and private schedule tracking.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology |
| :--- | :--- |
| **Engine** | Node.js (v20+) / Express.js |
| **Database** | MongoDB / Mongoose |
| **Frontend** | React 19 / Tailwind CSS / Bootstrap 5 |
| **Real-time** | Socket.io (WebSockets) |
| **Data Viz** | Recharts |
| **File Handling**| Multer (Local Storage) |
| **Auth** | JWT / Bcryptjs / Role-Based Access |
| **UI Icons** | Lucide-React |

---

## 🔄 How to Update & Maintain

### 1. Modifying the Schema
If you add or update a model (e.g., `backend/src/models/Invoice.js`), ensure you update the **ER Diagram** in `redme-relation.md` to keep documentation in sync.

### 2. Handling File Uploads
All files (Lessons/Assignments/Certificates) are stored in `backend/uploads/`.
- Ensure this directory has write permissions.
- In Docker, this is mapped as a persistent volume.

### 3. Real-time Features
To update real-time logic, modify the `io.on("connection")` block in `backend/src/server.js` and the corresponding hooks in the frontend `NotificationBell.js`.

### 4. Testing & Deployment
- **Backend Tests**: Run `npm test` in the `backend/` directory.
- **UI Consistency**: Use the **Tailwind CSS** utility classes to maintain the premium SaaS aesthetic. Avoid adding inline styles.

---

## 📂 Directory Structure
- `backend/src/controllers/`: Business logic for all modules.
- `backend/src/routes/`: API endpoint definitions.
- `frontend/src/roles/`: Role-specific page implementations (Admin, Teacher, Student, Secretary).
- `frontend/src/components/`: Reusable UI elements (Calendar, Charts, Notifications).

---

> [!IMPORTANT]
> To quickly populate the system with data, run `npm run seed:demo` in the `backend/` directory. This will generate sample users, invoices, lessons, and grades for testing.
=======
# school-sys-management
>>>>>>> 44c1a9dc94db7edcad802c0a31463087702bbcde

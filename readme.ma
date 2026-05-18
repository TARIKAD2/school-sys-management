# SchoolSys Management System - Full Documentation

## 1. General Application Architecture
The application is built using the **MERN Stack** (MongoDB, Express, React, Node.js).

*   **Frontend (React):** A modern, responsive dashboard-style interface. It communicates with the backend via RESTful API calls.
*   **Backend (Node.js & Express):** Handles business logic, authentication, and database interactions. It serves as the middleware between the users and the data.
*   **API Layer:** Modularized routes for different modules (Students, Teachers, Attendance, Grades, etc.).
*   **Database (MongoDB Atlas):** A cloud-hosted NoSQL database. Connection is established via a secure URI stored in environment variables.
*   **Data Flow:** 
    1.  User interacts with the UI.
    2.  Frontend sends a request with a **JWT token**.
    3.  Backend authenticates the user and checks their role via middleware.
    4.  The controller interacts with MongoDB Atlas to fetch/store data.
    5.  The response is sent back as JSON for the UI to display.

---

## 2. Database Explanation & Schema

### Core Collections
| Collection | Description | Relations |
| :--- | :--- | :--- |
| **Users** | Base authentication table | One-to-one with Student/Teacher profiles |
| **Students** | Student profiles and metadata | Belongs to a Class |
| **Teachers** | Teacher profiles and assignments | Linked to multiple Classes & Modules |
| **Classes** | Grouping of students by level | Contains many Students |
| **Modules** | Academic subjects (Math, Arabic, etc.) | Linked to Classes & Teachers |
| **Attendance** | Daily logs of student presence | Linked to Student, Class, and Module |
| **Exams/Grades** | Academic performance tracking | Linked to Exam -> Module/Class |
| **Payments** | Financial tracking (Invoices/Payments) | Linked to Student |

---

## 3. User Roles & Access Control Matrix

| Role | Description | Primary Permissions | Restrictions |
| :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | Full CRUD on all collections and settings | None |
| **Teacher** | Academic Staff | Manage grades/attendance for assigned classes | Cannot see finance or other teachers' data |
| **Secretary** | Administrative Staff | Manage students, attendance, and finances | Cannot modify grades or academic modules |
| **Student** | End User | View personal grades, attendance, and payments | Cannot see any data belonging to other users |

---

## 4. Access Control Implementation

### Authentication (Auth)
*   **Login:** Users authenticate using email and password.
*   **JWT:** Upon login, a JSON Web Token is issued and stored in cookies/headers.
*   **Identification:** The backend identifies the user via `req.user` which is populated by the `requireAuth` middleware.

### Authorization (Permissions)
*   **Role Protection:** Routes are protected using the `requireRole("role_name")` middleware.
*   **Data Privacy:** Controllers filter queries based on the user's ID or assigned classes. For example, a student is restricted to: `db.collection.find({ student: studentId })`.
*   **RBAC Middleware:** A specialized `teacherRBAC` ensures teachers can only submit grades/attendance for departments assigned to them.

---

## 5. Examples of Relations
1.  **User -> Appointment/Demand:** A student creates a "Demand" (Request). This demand belongs to that specific student.
2.  **Admin Visibility:** The Admin can view the "Demand" list from all students globally.
3.  **Student Privacy:** A student can only see the status of their own demands.
4.  **Teacher Context:** A teacher can view all students in "Class A" if they are assigned to it, but cannot view "Class B".

---

## 6. Code Locations
*   **Roles Definition:** `backend/src/models/User.js`
*   **Permission Checkers:** `backend/src/middleware/auth.js`
*   **Protected API Routes:** `backend/src/routes/*.js`
*   **Database Models:** `backend/src/models/*.js`
*   **UI Role Protection:** Check `frontend/src/roles/` layouts (e.g., `AdminLayout.js`, `StudentLayout.js`).

---

## 7. Security Features
*   **Password Hashing:** All passwords are encrypted using `bcryptjs` before being saved to Atlas.
*   **Token Expiry:** JWT tokens automatically expire to prevent session hijacking.
*   **API Scoping:** Every sensitive API endpoint checks the user's role before processing the request.

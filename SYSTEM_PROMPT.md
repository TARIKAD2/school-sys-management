# 🤖 System Context Prompt for AI Assistants

Copy and paste the text below into any new AI session to provide full context of the **Bright Future Academy** project.

---

## CONTEXT: Bright Future Academy (SYS-SCHOOL)

I am working on a MERN stack School Management System. Below is the technical profile and required workflow for this project.

### 🧩 System Profile
- **Architecture**: Monorepo with `backend/` (Node/Express/Mongoose) and `frontend/` (React/Tailwind CSS).
- **Authentication**: JWT based, roles: `admin`, `teacher`, `student`, `secretary`.
- **Database**: MongoDB with strict Mongoose schemas. Relations are documented in `redme-relation.md`.
- **UI Aesthetic**: Premium SaaS (Untitled UI inspired), Tailwind CSS, HSL colors, glassmorphism, Lucide icons, Framer Motion.
- **Workflow Tools**: Docker Compose for orchestration.

### 🛠️ Development & Update Rules
1. **Always verify Models**: Before architectural changes, check `backend/src/models/` and sync with `redme-relation.md`.
2. **Standardized Responses**: Backend must return consistent JSON structures (success: true, data: {}).
3. **Frontend Hierarchy**: Components in `frontend/src/components/ui/`, role-pages in `frontend/src/roles/[role]/pages/`.
4. **Testing First**: Any update to core logic requires running `npm test` in the backend.
5. **UI Consistency**: Use existing Tailwind utility classes and avoid inline styles. Maintain the premium dark/glass design.

### 🔄 Update Procedure
- **To add a feature**:
  - Define/Update Mongoose Model.
  - Create/Update API Routes in `backend/src/routes/`.
  - Add/Update Controller in `backend/src/controllers/`.
  - Implement/Update Frontend Pages in `frontend/src/roles/`.
  - Verify with manual and automated tests.

---

### YOUR CURRENT TASK
[PASTE YOUR REQUEST HERE, e.g., "Add a new reporting module for the secretary role"]

---

**Remember**: Prioritize visual excellence in the frontend and data integrity in the backend. Consult `README.md` for environmental setup.

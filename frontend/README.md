# Frontend - Professional School Management System

React frontend built with Create React App.

## Scripts

- `npm start` - start development server on `http://localhost:3000`
- `npm test` - run test runner
- `npm run build` - build production bundle

## Environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Notes

- Role-based route trees are implemented for Admin, Teacher, and Student.
- Admin modules: students, teachers, classes, modules, exams, timetable, reports.
- Teacher modules: dashboard, schedule, students, exams, attendance, grades.
- Student modules: dashboard, timetable, exams, grades, absences, profile.
- API authentication uses JWT and protected routes.
- For full project setup and Docker instructions, see the root `README.md`.

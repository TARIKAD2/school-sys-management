const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { env } = require("./utils/env");
const { notFoundHandler, errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const studentRoutes = require("./routes/students.routes");
const teacherRoutes = require("./routes/teachers.routes");
const classRoutes = require("./routes/classes.routes");
const moduleRoutes = require("./routes/modules.routes");
const examRoutes = require("./routes/exams.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const gradesRoutes = require("./routes/grades.routes");
const timetableRoutes = require("./routes/timetable.routes");
const demandRoutes = require("./routes/demands.routes");
const paymentsRoutes = require("./routes/payments.routes");
const elearningRoutes = require("./routes/elearning.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const eventsRoutes = require("./routes/events.routes");
const documentsRoutes = require("./routes/documents.routes");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => res.json({ message: "API is running" }));
app.get("/api", (req, res) => res.json({ message: "API base route working" }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/demands", demandRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/elearning", elearningRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/documents", documentsRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;


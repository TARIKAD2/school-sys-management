const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", eventsController.getEvents);
router.post("/", requireRole("admin"), eventsController.createEvent);
router.delete("/:id", requireRole("admin"), eventsController.deleteEvent);

module.exports = router;

const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", notificationsController.getNotifications);
router.patch("/read", notificationsController.markAsRead);
router.patch("/:id/read", notificationsController.markOneAsRead);

module.exports = router;

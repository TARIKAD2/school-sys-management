const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort("-createdAt")
    .limit(20);
  res.json({ success: true, data: notifications });
};

exports.markAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
};

exports.markOneAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
};

// Utility to send notification
exports.sendNotification = async (app, recipientId, data) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      link: data.link,
    });

    const io = app.get("io");
    if (io) {
      io.to(recipientId.toString()).emit("notification", notification);
    }
    return notification;
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
};

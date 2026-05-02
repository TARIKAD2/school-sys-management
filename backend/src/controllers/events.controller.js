const Event = require("../models/Event");

exports.getEvents = async (req, res) => {
  const events = await Event.find({
    $or: [
      { targetRoles: req.user.role },
      { targetRoles: { $size: 0 } }, // Public events
    ],
  }).sort("startDate");
  res.json({ success: true, data: events });
};

exports.createEvent = async (req, res) => {
  const event = await Event.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: event });
};

exports.deleteEvent = async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

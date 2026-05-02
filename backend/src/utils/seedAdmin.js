const { User } = require("../models/User");

async function seedAdmin({ email, password, name }) {
  if (!email || !password) return;

  const existing = await User.findOne({ role: "admin" });
  if (existing) return;

  const passwordHash = await User.hashPassword(password);
  await User.create({
    name: name || "System Admin",
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
  });
}

module.exports = { seedAdmin };


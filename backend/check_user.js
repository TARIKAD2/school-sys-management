const mongoose = require("mongoose");
const { User } = require("./src/models/User");
const { env } = require("./src/utils/env");

async function check() {
  await mongoose.connect(env.MONGO_URI);
  const user = await User.findOne({ email: "admin@school.com" });
  console.log("User:", JSON.stringify(user, null, 2));
  console.log("PasswordHash exists:", !!user?.passwordHash);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});

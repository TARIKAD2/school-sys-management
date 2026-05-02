const mongoose = require("mongoose");
const { env } = require("./src/utils/env");

async function checkRaw() {
  await mongoose.connect(env.MONGO_URI);
  const db = mongoose.connection.db;
  const user = await db.collection("users").findOne({ email: "admin@school.com" });
  console.log("Raw User:", JSON.stringify(user, null, 2));
  process.exit(0);
}

checkRaw().catch(err => {
  console.error(err);
  process.exit(1);
});

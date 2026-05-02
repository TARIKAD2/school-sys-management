const mongoose = require("mongoose");
const { env } = require("./src/utils/env");

async function migrate() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to database:", env.MONGO_URI);
  
  const db = mongoose.connection.db;
  const result = await db.collection("users").updateMany(
    { password: { $exists: true }, passwordHash: { $exists: false } },
    { $rename: { password: "passwordHash" } }
  );
  
  console.log("Migration result:", result);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});

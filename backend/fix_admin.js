const mongoose = require('mongoose');
const { User } = require('./src/models/User');
const { env } = require('./src/utils/env');

async function fixAdmin() {
  await mongoose.connect(env.MONGO_URI);
  const passwordHash = await User.hashPassword('school123');
  await User.updateOne({role: 'admin'}, { $set: { email: 'admin@school.com', passwordHash } });
  console.log('Fixed admin credentials');
  process.exit();
}

fixAdmin();

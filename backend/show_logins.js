const mongoose = require('mongoose');
const { User } = require('./src/models/User');
const { env } = require('./src/utils/env');

async function showLogins() {
  await mongoose.connect(env.MONGO_URI);
  const admin = await User.findOne({role: 'admin'});
  const sec = await User.findOne({role: 'secretary'});
  const teacher = await User.findOne({role: 'teacher'});
  const students = await User.find({role: 'student'}).limit(3);

  console.log("Admin email: " + (admin ? admin.email : 'None'));
  console.log("Secretary email: " + (sec ? sec.email : 'None'));
  console.log("Teacher email: " + (teacher ? teacher.email : 'None'));
  console.log("Student 1: " + (students[0] ? students[0].email : 'None'));
  console.log("Student 2: " + (students[1] ? students[1].email : 'None'));
  console.log("Student 3: " + (students[2] ? students[2].email : 'None'));
  process.exit();
}
showLogins();

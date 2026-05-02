const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "teacher", "student", "secretary"];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

UserSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, ROLES };


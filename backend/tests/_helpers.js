const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { User } = require("../src/models/User");

let mongo;

async function startInMemoryMongo() {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  return uri;
}

async function stopInMemoryMongo() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

async function createUser({ name, email, password, role }) {
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });
  return user;
}

module.exports = { startInMemoryMongo, stopInMemoryMongo, createUser };


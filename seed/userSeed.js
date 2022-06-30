const mongoose = require("mongoose");
require("dotenv/config");

const MONGO_URI = process.env.MONGODB_URI || `mongodb://127.0.0.1/evently`;

const User = require("../models/user.model");
const userData = require("./userData.json");

async function seed() {
  try {
    // Connection to the database
    const databaseInfo = await mongoose.connect(MONGO_URI);
    console.log(
      `Connected to Mongo! Database name: "${databaseInfo.connections[0].name}"`
    );
    await User.deleteMany();
    const usersCreated = await User.create(userData);
    console.log(`Created ${usersCreated.length} users`);
    mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
}

seed();

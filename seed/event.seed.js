const mongoose = require("mongoose");
require("dotenv/config");

const MONGO_URI = process.env.MONGODB_URI || `mongodb://127.0.0.1/evently`;

const Event = require("../models/Event.model");
const eventData = require("./eventData.seed.json");

async function seed() {
  try {
    // Connection to the database
    const databaseInfo = await mongoose.connect(MONGO_URI);
    console.log(
      `Connected to Mongo! Database name: "${databaseInfo.connections[0].name}"`
    );
    await Event.deleteMany();
    const eventsCreated = await Event.create(eventData);
    console.log(`Created ${eventsCreated.length} events`);
    mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
}

seed();

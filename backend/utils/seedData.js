/**
 * Seed script — populates the MongoDB internships collection
 * with sample data from data/sampleInternships.json.
 *
 * Run with:  npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const Internship = require("../models/Internship");
const internships = require("../data/sampleInternships.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing internships
    await Internship.deleteMany({});
    console.log("🗑️  Cleared existing internships");

    // Insert seed data
    await Internship.insertMany(internships);
    console.log(`✅ Seeded ${internships.length} internships`);

    await mongoose.connection.close();
    console.log("📦 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
}

seed();

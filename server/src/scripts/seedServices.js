import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Service } from "../models/Service.js";
import { services } from "../../../frontend/src/data.js";

try {
  await connectDatabase();
  await Service.init();
  for (const service of services) {
    const { n, ...record } = service;
    await Service.updateOne({ slug: record.slug }, { $setOnInsert: { ...record, displayOrder: Number(n) || 0, published: true } }, { upsert: true, runValidators: true });
  }
  const legacy = { reviewing: "contacted", closed: "completed" };
  for (const [from, to] of Object.entries(legacy)) await mongoose.connection.collection("enquiries").updateMany({ status: from }, { $set: { status: to } });
  console.log(`Seeded ${services.length} initial services (existing records were preserved).`);
} catch (error) {
  console.error(error.message?.includes("MONGODB_URI") ? error.message : "Service seed failed. Check the database connection.");
  process.exitCode = 1;
} finally { await disconnectDatabase(); }

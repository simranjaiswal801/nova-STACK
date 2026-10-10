import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

let httpServer;
let shuttingDown = false;
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters.",
    );
  if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL must be configured.");
  const connection = await connectDatabase();
  const port = Number.parseInt(process.env.PORT, 10) || 5000;
  httpServer = createApp().listen(port, () =>
    console.log(`NovaStack API listening on port ${port}; database connected.`),
  );
  connection.on("disconnected", () =>
    console.error(
      "MongoDB connection lost; database-backed requests will fail safely.",
    ),
  );
}
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down NovaStack API.`);
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
  await disconnectDatabase();
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
start().catch((error) => {
  console.error(
    error.message?.includes("MONGODB_URI") ||
      error.message?.includes("JWT_SECRET") ||
      error.message?.includes("FRONTEND_URL")
      ? error.message
      : "Could not start NovaStack API. Check the database connection and server configuration.",
  );
  process.exit(1);
});

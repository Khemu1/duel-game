import { createServer } from "node:http";
import app from "./app.js";
import createSocketServer from "./socket.js";

const PORT = 4005;
const httpServer = createServer(app);
const io = createSocketServer(httpServer); // attach socket.io to the SAME server

async function startServer() {
  try {
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      process.exit(1);
    });

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);
      io.close();
      httpServer.close(() => {
        // then the http server
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

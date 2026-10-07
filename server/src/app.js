import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposedHeaders: ["Content-Type", "Cache-Control", "Connection"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

export default app;

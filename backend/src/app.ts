// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { collectionsRoutes } from "./modules/collections/collections.routes";
import { workspacesRoutes } from "./modules/workspaces/workspaces.routes";
import { requestsRoutes } from "./modules/requests/requests.routes";
import { environmentsRoutes } from "./modules/environments/environments.routes";
import { requestHistoriesRoutes } from "./modules/request_histories/reqhistories.routes";
// import dotenv from 'dotenv'; // If not already loaded elsewhere

// dotenv.config(); // Load environment variables

const app = express();

// Global Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with increased limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with increased limit

// --- Routes ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use("/api/collections", collectionsRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/environments", environmentsRoutes);
app.use("/api/request-histories", requestHistoriesRoutes);

// --- Global Error Handler ---
// This should be the last middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack || err.message);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle other errors
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optional: show stack in dev
  });
});


export default app;

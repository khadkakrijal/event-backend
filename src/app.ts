// src/app.ts
import express from "express";
import cors from "cors";

import eventsRouter from "./routes/events";
import galleriesRouter from "./routes/galleries";
import albumsRouter from "./routes/albums";
import ticketsRouter from "./routes/tickets";
import connectRouter from "./routes/connect";
import reportsRouter from "./routes/reports";

function parseAllowedOrigins(src?: string) {
  if (!src) return [];
  return src
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, "")) // strip trailing slash(es)
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // server-to-server / curl
        const normalized = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(normalized)) return cb(null, true);
        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  // Optional CORS debug endpoint (remove later)
  app.get("/__debug/cors", (req, res) => {
    res.json({
      env_CORS_ORIGIN: process.env.CORS_ORIGIN,
      allowedOrigins,
      receivedOrigin: req.headers.origin,
      normalizedOrigin: req.headers.origin?.replace(/\/+$/, ""),
    });
  });

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  const hasSupabaseEnv =
    !!(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
    );

  app.get("/", (_req, res) => {
    if (!hasSupabaseEnv) {
      return res
        .status(500)
        .send(
          "Backend is up but Supabase env vars are missing. Add them in Vercel → Settings → Environment Variables."
        );
    }
    res.send("Hello World from Event Backend!");
  });

  if (hasSupabaseEnv) {
    app.use("/events", eventsRouter);
    app.use("/galleries", galleriesRouter);
    app.use("/albums", albumsRouter);
    app.use("/tickets", ticketsRouter);
    app.use("/connect", connectRouter);
    app.use("/reports", reportsRouter);
  }

  return app;
}

// src/app.ts
import express from "express";
import cors from "cors";

import eventsRouter from "./routes/events";
import galleriesRouter from "./routes/galleries";
import albumsRouter from "./routes/albums";
import ticketsRouter from "./routes/tickets";
import connectRouter from "./routes/connect";
import reportsRouter from "./routes/reports";

/** Parse comma-separated origins and normalize (strip trailing slashes). */
function parseAllowedOrigins(src?: string) {
  if (!src) return [];
  return src
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, "")) // remove trailing slash(es)
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

  app.use(
    cors({
      origin: (origin, cb) => {
        // allow server-to-server / curl (no Origin header)
        if (!origin) return cb(null, true);

        // normalize the incoming Origin (strip trailing slash)
        const o = origin.replace(/\/+$/, "");

        // allow exact matches from env
        if (allowedOrigins.includes(o)) return cb(null, true);

        // (optional) allow your preview domains; customize if you want
        // if (o.endsWith(".vercel.app") && o.includes("event-system")) return cb(null, true);

        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,            // set to false if you never use cookies/auth headers
      optionsSuccessStatus: 204,    // for legacy browsers
    })
  );

  // NOTE (Express 5): do NOT use app.options("*", cors()) — use "(.*)" only if you need it:
  // app.options("(.*)", cors());

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

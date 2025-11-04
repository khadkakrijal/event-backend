import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events";
import galleriesRouter from "./routes/galleries";
import albumsRouter from "./routes/albums";
import ticketsRouter from "./routes/tickets";
import connectRouter from "./routes/connect";
import reportsRouter from "./routes/reports";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  app.get("/", (_req, res) => {
    res.send(" Hello World from Event Backend!");
  });

  app.use("/events", eventsRouter);
  app.use("/galleries", galleriesRouter);
  app.use("/albums", albumsRouter);
  app.use("/tickets", ticketsRouter);
  app.use("/connect", connectRouter);
  app.use("/reports", reportsRouter);

  return app;
}

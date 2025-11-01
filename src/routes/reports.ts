import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { supabase } from "../supabase";

const router = express.Router();

/**
 * GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&eventId=1
 * Returns:
 *  - counters (totals)
 *  - perEvent (table)
 *  - daily (time series)
 */
router.get(
  "/summary",
  asyncHandler(async (req: Request, res: Response) => {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;

    // Daily chart (filtered by date)
    let dailyQuery = supabase.from("v_daily_ticket_sales").select("*");
    if (from) dailyQuery = dailyQuery.gte("day", from);
    if (to) dailyQuery = dailyQuery.lte("day", to);

    const { data: daily, error: dailyErr } = await dailyQuery;
    if (dailyErr) {
      res.status(500).json({ error: dailyErr.message });
      return;
    }

    // Per-event table
    let perEventQuery = supabase.from("v_event_ticket_stats").select("*");
    if (eventId) perEventQuery = perEventQuery.eq("event_id", eventId);
    if (from) perEventQuery = perEventQuery.gte("event_date", from);
    if (to) perEventQuery = perEventQuery.lte("event_date", to);

    const { data: perEvent, error: perEventErr } = await perEventQuery;
    if (perEventErr) {
      res.status(500).json({ error: perEventErr.message });
      return;
    }

    // Counters
    const totalEvents = perEvent.length;
    const ticketsSold = perEvent.reduce((s, r) => s + (r.tickets_sold || 0), 0);
    const uniqueBuyers = perEvent.reduce((s, r) => s + (r.unique_buyers || 0), 0);

    res.json({
      counters: { totalEvents, ticketsSold, uniqueBuyers },
      perEvent,
      daily,
    });
  })
);

export default router;

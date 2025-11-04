"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
/**
 * GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&eventId=1
 * Returns:
 *  - counters (totals)
 *  - perEvent (table)
 *  - daily (time series)
 */
router.get("/summary", (0, express_async_handler_1.default)(async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
    // Daily chart (filtered by date)
    let dailyQuery = supabase_1.supabase.from("v_daily_ticket_sales").select("*");
    if (from)
        dailyQuery = dailyQuery.gte("day", from);
    if (to)
        dailyQuery = dailyQuery.lte("day", to);
    const { data: daily, error: dailyErr } = await dailyQuery;
    if (dailyErr) {
        res.status(500).json({ error: dailyErr.message });
        return;
    }
    // Per-event table
    let perEventQuery = supabase_1.supabase.from("v_event_ticket_stats").select("*");
    if (eventId)
        perEventQuery = perEventQuery.eq("event_id", eventId);
    if (from)
        perEventQuery = perEventQuery.gte("event_date", from);
    if (to)
        perEventQuery = perEventQuery.lte("event_date", to);
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
}));
exports.default = router;
//# sourceMappingURL=reports.js.map
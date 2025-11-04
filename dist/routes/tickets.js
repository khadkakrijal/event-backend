"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../supabase");
const zod_1 = require("zod");
const router = express_1.default.Router();
const TicketSchema = zod_1.z.object({
    event_id: zod_1.z.coerce.number().int().min(1),
    username: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    quantity: zod_1.z.coerce.number().int().min(1).max(10),
    ticket_type: zod_1.z.string().min(1),
});
// GET /tickets?eventId=...
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const eventId = req.query.eventId;
    let query = supabase_1.supabase.from("tickets").select("*");
    if (eventId)
        query = query.eq("event_id", eventId);
    const { data, error } = await query;
    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// GET /tickets/:id
router.get("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// POST /tickets
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const parsed = TicketSchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("Zod validation error:", parsed.error.flatten());
        res
            .status(400)
            .json({ error: "Invalid body", details: parsed.error.flatten() });
        return;
    }
    const { event_id, username, email, quantity, ticket_type } = parsed.data;
    // 1) Ensure event exists and is sellable
    const { data: event, error: evErr } = await supabase_1.supabase
        .from("events")
        .select("id, ticket_available")
        .eq("id", event_id)
        .single();
    if (evErr || !event) {
        console.error("Event lookup error:", evErr?.message);
        res.status(404).json({ error: "Event not found" });
        return;
    }
    if (event.ticket_available !== true) {
        res
            .status(400)
            .json({ error: "Tickets are not available for this event" });
        return;
    }
    // 2) Insert ticket
    const { data, error } = await supabase_1.supabase
        .from("tickets")
        .insert({
        event_id,
        username,
        email,
        quantity,
        ticket_type,
        purchased_date: new Date().toISOString(),
    })
        .select()
        .single();
    if (error) {
        console.error("Supabase insert error:", error.message);
        res
            .status(500)
            .json({ error: "Failed to create ticket", details: error.message });
        return;
    }
    res.status(201).json({ success: true, ticket: data });
    return;
}));
// PUT /tickets/:id
router.put("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase
        .from("tickets")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// DELETE /tickets/:id
router.delete("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase.from("tickets").delete().eq("id", id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json({ success: true });
    return;
}));
exports.default = router;
//# sourceMappingURL=tickets.js.map
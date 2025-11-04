"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
// GET /events?mode=past|upcoming
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const mode = req.query.mode ?? "";
    let query = supabase_1.supabase.from("events").select("*");
    if (mode === "past") {
        query = query.lt("date", new Date().toISOString()).order("date", { ascending: false });
    }
    else if (mode === "upcoming") {
        query = query.gte("date", new Date().toISOString()).order("date", { ascending: true });
    }
    else {
        query = query.order("date", { ascending: true });
    }
    const { data, error } = await query;
    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// GET /events/:id
router.get("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from("events").select("*").eq("id", id).single();
    if (error) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// POST /events
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const { data, error } = await supabase_1.supabase.from("events").insert(req.body).select().single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(201).json(data);
    return;
}));
// PUT /events/:id
router.put("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from("events").update(req.body).eq("id", id).select().single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// DELETE /events/:id
router.delete("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase.from("events").delete().eq("id", id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json({ success: true });
    return;
}));
exports.default = router;
//# sourceMappingURL=events.js.map
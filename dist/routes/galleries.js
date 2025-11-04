"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
// GET /galleries?eventId=...
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const eventId = req.query.eventId;
    let query = supabase_1.supabase.from("galleries").select("*, albums(image_url)");
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
// GET /galleries/:id
router.get("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from("galleries").select("*, albums(image_url)").eq("id", id).single();
    if (error) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// POST /galleries
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const { data, error } = await supabase_1.supabase.from("galleries").insert(req.body).select().single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(201).json(data);
    return;
}));
// PUT /galleries/:id
router.put("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from("galleries").update(req.body).eq("id", id).select().single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
// DELETE /galleries/:id
router.delete("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase.from("galleries").delete().eq("id", id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json({ success: true });
    return;
}));
exports.default = router;
//# sourceMappingURL=galleries.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
/* ------------------------------------------------------------------
   ✅ GET /connect
   Fetch all feedback entries (for admin dashboard)
------------------------------------------------------------------ */
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const { data, error } = await supabase_1.supabase
        .from("connect")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("❌ Error fetching connect records:", error.message);
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
}));
/* ------------------------------------------------------------------
   ✅ GET /connect/:id
   Fetch a single feedback record by ID
------------------------------------------------------------------ */
router.get("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase
        .from("connect")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.json(data);
}));
/* ------------------------------------------------------------------
   ✅ POST /connect
   Add new feedback from the frontend form
------------------------------------------------------------------ */
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const { fullName, email, contact, country, city, comment } = req.body;
    // basic validation
    if (!fullName || !email) {
        res.status(400).json({ error: "Full name and email are required." });
        return;
    }
    console.log("Received body:", req.body);
    const { data, error } = await supabase_1.supabase.from("connect").insert([
        {
            full_name: fullName,
            email,
            contact,
            country,
            city,
            comment,
        },
    ])
        .select()
        .single();
    if (error) {
        console.error("❌ Error inserting connect record:", error.message);
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(201).json(data);
}));
/* ------------------------------------------------------------------
   ✅ DELETE /connect/:id
   Remove a feedback record (optional for admin cleanup)
------------------------------------------------------------------ */
router.delete("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase.from("connect").delete().eq("id", id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json({ success: true });
}));
exports.default = router;
//# sourceMappingURL=connect.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/albums.ts
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
/* =========================
   Zod Schemas
========================= */
const AlbumCreateSchema = zod_1.z.object({
    gallery_id: zod_1.z.number().int(),
    image_url: zod_1.z.string().min(1), // base64 or URL
});
const AlbumUpdateSchema = zod_1.z.object({
    gallery_id: zod_1.z.number().int().optional(),
    image_url: zod_1.z.string().min(1).optional(),
});
const AlbumBulkCreateSchema = zod_1.z.object({
    gallery_id: zod_1.z.number().int(),
    images: zod_1.z.array(zod_1.z.string().min(1)).min(1), // base64 or URLs
});
/* =========================
   GET /albums?galleryId=...
========================= */
router.get("/", (0, express_async_handler_1.default)(async (req, res) => {
    const galleryIdRaw = req.query.galleryId;
    let query = supabase_1.supabase.from("albums").select("*");
    if (galleryIdRaw !== undefined) {
        const galleryId = Number(galleryIdRaw);
        if (Number.isNaN(galleryId)) {
            res.status(400).json({ error: "Invalid galleryId (must be a number)" });
            return;
        }
        query = query.eq("gallery_id", galleryId);
    }
    const { data, error } = await query;
    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
/* =========================
   GET /albums/:id
========================= */
router.get("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "Invalid id (must be a number)" });
        return;
    }
    const { data, error } = await supabase_1.supabase.from("albums").select("*").eq("id", id).single();
    if (error) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
/* =========================
   POST /albums  (single)
========================= */
router.post("/", (0, express_async_handler_1.default)(async (req, res) => {
    const parsed = AlbumCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        return;
    }
    const { gallery_id, image_url } = parsed.data;
    const { data, error } = await supabase_1.supabase
        .from("albums")
        .insert({ gallery_id, image_url })
        .select()
        .single();
    if (error) {
        res.status(500).json({ error: "Failed to create album", details: error.message });
        return;
    }
    res.status(201).json(data);
    return;
}));
/* =========================
   POST /albums/bulk  (many)
========================= */
router.post("/bulk", (0, express_async_handler_1.default)(async (req, res) => {
    const parsed = AlbumBulkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        return;
    }
    const { gallery_id, images } = parsed.data;
    const rows = images.map((img) => ({ gallery_id, image_url: img }));
    const { data, error } = await supabase_1.supabase.from("albums").insert(rows).select();
    if (error) {
        res.status(500).json({ error: "Failed to create albums", details: error.message });
        return;
    }
    res.status(201).json({ created: data?.length ?? 0, albums: data });
    return;
}));
/* =========================
   PUT /albums/:id
========================= */
router.put("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "Invalid id (must be a number)" });
        return;
    }
    const parsed = AlbumUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        return;
    }
    const { data, error } = await supabase_1.supabase.from("albums").update(parsed.data).eq("id", id).select().single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json(data);
    return;
}));
/* =========================
   DELETE /albums/:id
========================= */
router.delete("/:id", (0, express_async_handler_1.default)(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "Invalid id (must be a number)" });
        return;
    }
    const { error } = await supabase_1.supabase.from("albums").delete().eq("id", id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.json({ success: true });
    return;
}));
exports.default = router;
//# sourceMappingURL=albums.js.map
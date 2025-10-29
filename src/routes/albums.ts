// src/routes/albums.ts
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { supabase } from "../supabase";

const router = express.Router();

/* =========================
   Zod Schemas
========================= */
const AlbumCreateSchema = z.object({
  gallery_id: z.number().int(),
  image_url: z.string().min(1), // base64 or URL
});

const AlbumUpdateSchema = z.object({
  gallery_id: z.number().int().optional(),
  image_url: z.string().min(1).optional(),
});

const AlbumBulkCreateSchema = z.object({
  gallery_id: z.number().int(),
  images: z.array(z.string().min(1)).min(1), // base64 or URLs
});

/* =========================
   GET /albums?galleryId=...
========================= */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const galleryIdRaw = req.query.galleryId as string | undefined;
    let query = supabase.from("albums").select("*");

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
  })
);

/* =========================
   GET /albums/:id
========================= */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id (must be a number)" });
      return;
    }

    const { data, error } = await supabase.from("albums").select("*").eq("id", id).single();
    if (error) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

/* =========================
   POST /albums  (single)
========================= */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = AlbumCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const { gallery_id, image_url } = parsed.data;
    const { data, error } = await supabase
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
  })
);

/* =========================
   POST /albums/bulk  (many)
========================= */
router.post(
  "/bulk",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = AlbumBulkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const { gallery_id, images } = parsed.data;
    const rows = images.map((img) => ({ gallery_id, image_url: img }));

    const { data, error } = await supabase.from("albums").insert(rows).select();
    if (error) {
      res.status(500).json({ error: "Failed to create albums", details: error.message });
      return;
    }

    res.status(201).json({ created: data?.length ?? 0, albums: data });
    return;
  })
);

/* =========================
   PUT /albums/:id
========================= */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
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

    const { data, error } = await supabase.from("albums").update(parsed.data).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

/* =========================
   DELETE /albums/:id
========================= */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id (must be a number)" });
      return;
    }

    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ success: true });
    return;
  })
);

export default router;

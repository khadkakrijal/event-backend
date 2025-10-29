import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { supabase } from "../supabase";

const router = express.Router();

// GET /galleries?eventId=...
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const eventId = req.query.eventId as string | undefined;
    let query = supabase.from("galleries").select("*, albums(image_url)");
    if (eventId) query = query.eq("event_id", eventId);

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

// GET /galleries/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("galleries").select("*, albums(image_url)").eq("id", id).single();

    if (error) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

// POST /galleries
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase.from("galleries").insert(req.body).select().single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
    return;
  })
);

// PUT /galleries/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("galleries").update(req.body).eq("id", id).select().single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

// DELETE /galleries/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from("galleries").delete().eq("id", id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ success: true });
    return;
  })
);

export default router;

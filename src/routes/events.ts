import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { supabase } from "../supabase";

const router = express.Router();

// GET /events?mode=past|upcoming
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const mode = (req.query.mode as string) ?? "";
    let query = supabase.from("events").select("*");

    if (mode === "past") {
      query = query.lt("date", new Date().toISOString()).order("date", { ascending: false });
    } else if (mode === "upcoming") {
      query = query.gte("date", new Date().toISOString()).order("date", { ascending: true });
    } else {
      query = query.order("date", { ascending: true });
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

// GET /events/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

    if (error) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

// POST /events
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase.from("events").insert(req.body).select().single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
    return;
  })
);

// PUT /events/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("events").update(req.body).eq("id", id).select().single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
    return;
  })
);

// DELETE /events/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ success: true });
    return;
  })
);

export default router;

import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { supabase } from "../supabase";
import { z } from "zod";

const router = express.Router();

const TicketSchema = z.object({
  event_id: z.coerce.number().int().min(1),
  username: z.string().min(2),
  email: z.string().email(),
  quantity: z.coerce.number().int().min(1).max(10),
  ticket_type: z.string().min(1),
});
// GET /tickets?eventId=...
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const eventId = req.query.eventId as string | undefined;
    let query = supabase.from("tickets").select("*");
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

// GET /tickets/:id
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
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
  })
);

// POST /tickets

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
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
    const { data: event, error: evErr } = await supabase
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
    const { data, error } = await supabase
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
  })
);

// PUT /tickets/:id
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
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
  })
);

// DELETE /tickets/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from("tickets").delete().eq("id", id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ success: true });
    return;
  })
);

export default router;

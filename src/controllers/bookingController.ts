import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { space_id, user_id, start_time, end_time } = req.body;

    // 1. Basic Validation
    if (!space_id || !user_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    // 2. CONFLICT CHECK (The most important part)
    // Logic: Look for any booking for this room where:
    // (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
    const { data: conflicts, error: conflictError } = await supabase
      .from("bookings")
      .select("id")
      .eq("space_id", space_id)
      .lt("start_time", end.toISOString()) // Existing start is before new end
      .gt("end_time", start.toISOString()); // Existing end is after new start

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: "Time slot already booked!" });
    }

    // 3. Create Booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ space_id, user_id, start_time, end_time }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getBookingsBySpace = async (req: Request, res: Response) => {
  try {
    const { space_id } = req.query;
    if (!space_id) return res.status(400).json({ error: "Space ID required" });

    // Get bookings for this space (optional: filter by date to optimize)
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("space_id", space_id)
      .order("start_time", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { start_time, end_time, floor_id } = req.query;

    if (!start_time || !end_time) {
      return res.status(400).json({ error: "Start and End time required" });
    }

    // Convert strings to Dates for comparison if needed,
    // but Supabase/Postgres handles ISO strings well.

    // Logic: Find bookings that overlap with the requested window
    // AND (optionally) belong to spaces on the specific floor
    let query = supabase
      .from("bookings")
      .select("space_id")
      .lt("start_time", end_time) // Booking starts before window ends
      .gt("end_time", start_time); // Booking ends after window starts

    // If floor_id is provided, we could filter by floor,
    // but bookings only store space_id.
    // Optimization: We fetch all occupied IDs, frontend decides which to color.
    // (For huge apps, we'd join tables, but for this size, it's fine).

    const { data, error } = await query;

    if (error) throw error;

    // Return simple array of occupied space IDs: ['id1', 'id2']
    const occupiedIds = data.map((b: any) => b.space_id);

    // usage of Set to remove duplicates
    const uniqueIds = [...new Set(occupiedIds)];

    res.json(uniqueIds);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Get all bookings for a specific user, including Room details
export const getBookingsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // Join with 'spaces' table to get the room name
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        spaces (
          name,
          type
        )
      `
      )
      .eq("user_id", user_id)
      .order("start_time", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Cancel (Delete) a booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Booking cancelled" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

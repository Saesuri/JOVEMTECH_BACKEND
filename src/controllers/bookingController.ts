import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { writeLog } from "./logController";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { space_id, user_id, start_time, end_time } = req.body;
    const actorId = req.headers["x-user-id"] || user_id;

    if (!space_id || !user_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    // Conflict Check
    const { data: conflicts, error: conflictError } = await supabase
      .from("bookings")
      .select("id")
      .eq("space_id", space_id)
      .lt("start_time", end.toISOString())
      .gt("end_time", start.toISOString());

    if (conflictError) throw conflictError;
    if (conflicts && conflicts.length > 0)
      return res.status(409).json({ error: "Time slot occupied" });

    // Create
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ space_id, user_id, start_time, end_time }])
      .select("*, spaces(name)"); 

    if (error) throw error;

    // LOG
    const roomName = (data[0] as any).spaces?.name || "Room";
    await writeLog(actorId, "CREATE_BOOKING", `Booked ${roomName}`);

    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingsBySpace = async (req: Request, res: Response) => {
  try {
    const { space_id } = req.query;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("space_id", space_id);
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { start_time, end_time } = req.query;
    if (!start_time || !end_time)
      return res.status(400).json({ error: "Params missing" });

    const { data, error } = await supabase
      .from("bookings")
      .select("space_id")
      .lt("start_time", end_time)
      .gt("end_time", start_time);

    if (error) throw error;
    const occupiedIds = [...new Set(data.map((b: any) => b.space_id))];
    res.json(occupiedIds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from("bookings")
      .select("*, spaces(name, type)")
      .eq("user_id", user_id)
      .order("start_time", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBookingsAdmin = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, created_at, spaces(name, type), profiles(email)"
      )
      .order("start_time", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"]; 

    // Fetch details before delete
    const { data: booking } = await supabase
      .from("bookings")
      .select("*, spaces(name), profiles(email)")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) throw error;

    // LOG
    if (booking) {
      await writeLog(
        userId,
        "CANCEL_BOOKING",
        `Cancelled booking for ${booking.profiles?.email} in ${booking.spaces?.name}`
      );
    }

    res.json({ message: "Booking cancelled" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

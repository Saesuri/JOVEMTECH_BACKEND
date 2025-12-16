import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { writeLog } from "./logController";

export const getFloors = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("floors").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createFloor = async (req: Request, res: Response) => {
  try {
    const { name, width, height } = req.body;
    const userId = req.headers["x-user-id"]; 

    const { data, error } = await supabase
      .from("floors")
      .insert([{ name, width, height }])
      .select();

    if (error) throw error;

    // LOG
    await writeLog(userId, "CREATE_FLOOR", `Created floor: ${name}`);

    res.json(data[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.headers["x-user-id"];

    const { data, error } = await supabase
      .from("floors")
      .update({ name })
      .eq("id", id)
      .select();

    if (error) throw error;

    // LOG
    await writeLog(userId, "UPDATE_FLOOR", `Renamed floor to: ${name}`);

    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFloorStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: spaces, error: spaceError } = await supabase
      .from("spaces")
      .select("id")
      .eq("floor_id", id);
    if (spaceError) throw spaceError;

    const spaceCount = spaces.length;
    let bookingCount = 0;

    if (spaceCount > 0) {
      const spaceIds = spaces.map((s) => s.id);
      const { count, error: bookingError } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .in("space_id", spaceIds);

      if (bookingError) throw bookingError;
      bookingCount = count || 0;
    }
    res.json({ spaceCount, bookingCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    // Get name for log before deleting
    const { data: floor } = await supabase
      .from("floors")
      .select("name")
      .eq("id", id)
      .single();
    const floorName = floor ? floor.name : "Unknown Floor";

    // 1. Fetch spaces
    const { data: spaces } = await supabase
      .from("spaces")
      .select("id")
      .eq("floor_id", id);

    if (spaces && spaces.length > 0) {
      const spaceIds = spaces.map((s) => s.id);
      // 2. Delete bookings
      await supabase.from("bookings").delete().in("space_id", spaceIds);
      // 3. Delete spaces
      await supabase.from("spaces").delete().eq("floor_id", id);
    }

    // 4. Delete floor
    const { error: floorError } = await supabase
      .from("floors")
      .delete()
      .eq("id", id);
    if (floorError) throw floorError;

    // LOG
    await writeLog(
      userId,
      "DELETE_FLOOR",
      `Deleted floor: ${floorName} and all contents`
    );

    res.json({ message: "Floor deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

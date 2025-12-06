import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const getFloors = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("floors").select("*");

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching floors:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createFloor = async (req: Request, res: Response) => {
  try {
    const { name, width, height } = req.body;
    // Check if floor exists first to avoid duplicates (optional improvement)
    const { data, error } = await supabase
      .from("floors")
      .insert([{ name, width, height }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    console.error("Error creating floor:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Update Floor (Rename)
export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { data, error } = await supabase
      .from('floors')
      .update({ name })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Floor
export const deleteFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Find all spaces (rooms) on this floor
    const { data: spaces, error: fetchError } = await supabase
      .from('spaces')
      .select('id')
      .eq('floor_id', id);

    if (fetchError) throw fetchError;

    // If there are spaces, we must clean them up first
    if (spaces && spaces.length > 0) {
      const spaceIds = spaces.map((s) => s.id);

      // 2. Delete ALL bookings for these spaces
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .in('space_id', spaceIds);

      if (bookingError) throw bookingError;

      // 3. Delete the spaces themselves
      const { error: spaceError } = await supabase
        .from('spaces')
        .delete()
        .eq('floor_id', id); // or .in('id', spaceIds)

      if (spaceError) throw spaceError;
    }

    // 4. Finally, delete the floor
    const { error: floorError } = await supabase
      .from('floors')
      .delete()
      .eq('id', id);

    if (floorError) throw floorError;

    res.json({ message: "Floor and all associated data deleted successfully" });
  } catch (error: any) {
    console.error("Delete Floor Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getFloorStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Get Spaces on this floor
    const { data: spaces, error: spaceError } = await supabase
      .from('spaces')
      .select('id')
      .eq('floor_id', id);

    if (spaceError) throw spaceError;

    const spaceCount = spaces.length;
    let bookingCount = 0;

    // 2. If there are spaces, count their bookings
    if (spaceCount > 0) {
      const spaceIds = spaces.map(s => s.id);
      const { count, error: bookingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true }) // count only
        .in('space_id', spaceIds);

      if (bookingError) throw bookingError;
      bookingCount = count || 0;
    }

    res.json({ spaceCount, bookingCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

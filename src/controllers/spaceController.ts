import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { writeLog } from "./logController";

export const saveSpace = async (req: Request, res: Response) => {
  try {
    const {
      id,
      floor_id,
      name,
      type,
      capacity,
      coordinates,
      description,
      amenities,
    } = req.body;
    const userId = req.headers["x-user-id"];

    const isUpdate = !!id;

    const { data, error } = await supabase
      .from("spaces")
      .upsert([
        {
          id,
          floor_id,
          name,
          type,
          capacity,
          coordinates,
          description,
          amenities,
        },
      ])
      .select();

    if (error) throw error;

    // LOG
    const action = isUpdate ? "UPDATE_SPACE" : "CREATE_SPACE";
    await writeLog(
      userId,
      action,
      `${isUpdate ? "Updated" : "Created"} room: ${name}`
    );

    res.json(data[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSpaces = async (req: Request, res: Response) => {
  try {
    const { floor_id } = req.query;
    if (!floor_id) return res.status(400).json({ error: "Floor ID required" });

    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("floor_id", floor_id);
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSpacesGlobal = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("spaces")
      .select("*, floors(name)")
      .order("name");
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSpace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, description, amenities } = req.body;
    const userId = req.headers["x-user-id"];

    const { data, error } = await supabase
      .from("spaces")
      .update({ name, type, capacity, description, amenities })
      .eq("id", id)
      .select();

    if (error) throw error;

    // LOG
    await writeLog(
      userId,
      "UPDATE_SPACE_DETAILS",
      `Updated details for room: ${name}`
    );

    res.json(data[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSpace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    // Get name for log
    const { data: space } = await supabase
      .from("spaces")
      .select("name")
      .eq("id", id)
      .single();
    const spaceName = space ? space.name : "Unknown Room";

    // Cascade delete bookings
    await supabase.from("bookings").delete().eq("space_id", id);

    const { error } = await supabase.from("spaces").delete().eq("id", id);
    if (error) throw error;

    // LOG
    await writeLog(userId, "DELETE_SPACE", `Deleted room: ${spaceName}`);

    res.json({ message: "Space deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

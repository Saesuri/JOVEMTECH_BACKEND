import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const saveSpace = async (req: Request, res: Response) => {
  try {
    const { floor_id, name, type, capacity, coordinates } = req.body;

    console.log("Attempting to save space:", name);

    const { data, error } = await supabase
      .from("spaces")
      .insert([{ floor_id, name, type, capacity, coordinates }])
      .select();

    if (error) throw error;

    console.log("Space saved:", data[0].id);
    res.json(data[0]);
  } catch (error: any) {
    console.error("Error saving space:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getSpaces = async (req: Request, res: Response) => {
  try {
    const { floor_id } = req.query;

    if (!floor_id) {
      return res.status(400).json({ error: "Floor ID is required" });
    }

    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("floor_id", floor_id);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching spaces:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSpace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, capacity } = req.body;

    const { data, error } = await supabase
      .from("spaces")
      .update({ name, type, capacity })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: unknown) {
    // Strict error handling without 'any'
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating space:", message);
    res.status(400).json({ error: message });
  }
};

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

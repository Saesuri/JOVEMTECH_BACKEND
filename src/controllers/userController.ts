import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { writeLog } from "./logController";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to get profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.warn(`Profile missing for ${id}, returning default skeleton.`);
        // Return a dummy profile so the UI loads successfully
        return res.json({
          id,
          email: "", // Email will be missing initially, but UI handles it
          role: "user",
          full_name: "",
          phone: "",
          department: "",
        });
      }
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, phone, department } = req.body;
    const actorId = req.headers["x-user-id"];


    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id, 
        full_name,
        phone,
        department,
<<<<<<< HEAD
        // Demo mode
        ...(role && { role }),
=======
>>>>>>> 766233a049922018501d72d9a6020cd33bd39fcd
      })
      .select();

    if (error) throw error;

    // Log the action
    await writeLog(
      actorId,
      "UPDATE_PROFILE",
      `Updated profile details for user ${id}`
    );

    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

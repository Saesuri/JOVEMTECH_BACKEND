import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { writeLog } from "./logController";

// --- ROOM TYPES ---
export const getRoomTypes = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .order("label");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createRoomType = async (req: Request, res: Response) => {
  const { value, label } = req.body;
  const userId = req.headers["x-user-id"];

  const { data, error } = await supabase
    .from("room_types")
    .insert([{ value, label }])
    .select();
  if (error) return res.status(500).json({ error: error.message });

  await writeLog(userId, "CONFIG_CREATE", `Created room category: ${label}`);
  res.json(data[0]);
};

export const deleteRoomType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.headers["x-user-id"];

  const { error } = await supabase.from("room_types").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  await writeLog(userId, "CONFIG_DELETE", `Deleted room category ID: ${id}`);
  res.json({ message: "Deleted" });
};

// --- USER MANAGEMENT ---
export const getUsers = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("email");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const userId = req.headers["x-user-id"];

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });

  // Get target email for log
  const targetEmail = data[0].email;
  await writeLog(
    userId,
    "USER_ROLE_CHANGE",
    `Changed role of ${targetEmail} to ${role}`
  );

  res.json(data[0]);
};

// --- ROOM MAINTENANCE TOGGLE ---
export const toggleRoomStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;
  const userId = req.headers["x-user-id"];

  const { data, error } = await supabase
    .from("spaces")
    .update({ is_active })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });

  const spaceName = data[0].name;
  await writeLog(
    userId,
    "MAINTENANCE_TOGGLE",
    `Set ${spaceName} to ${is_active ? "Active" : "Maintenance"}`
  );

  res.json(data[0]);
};

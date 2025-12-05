import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in .env file");
}

// We use the Service Role key (if available) to bypass RLS for admin tasks,
// or the Anon key for standard tasks.
export const supabase = createClient(supabaseUrl, supabaseKey);

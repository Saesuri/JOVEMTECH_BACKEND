import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Helper function to write logs
// We use 'any' for the actor_id temporarily to handle cases where header might be string array
export const writeLog = async (actor_id: any, action: string, details: string) => {
    if (!actor_id) return; // Don't log anonymous actions (or log as 'system')

    // Ensure actor_id is a string
    const uid = Array.isArray(actor_id) ? actor_id[0] : actor_id;

    try {
        await supabase.from('audit_logs').insert([{
            actor_id: uid,
            action,
            details
        }]);
    } catch (error) {
        console.error("Failed to write audit log", error);
    }
};

// Endpoint to fetch logs
export const getLogs = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, profiles(email)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
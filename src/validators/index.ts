import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// ============================================
// FLOOR SCHEMAS
// ============================================

export const createFloorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  width: z.number().positive("Width must be positive").optional(),
  height: z.number().positive("Height must be positive").optional(),
});

export const updateFloorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

// ============================================
// SPACE SCHEMAS
// ============================================

export const createSpaceSchema = z.object({
  id: z.string().uuid().optional(), // Optional for updates
  floor_id: z.string().uuid("Invalid floor ID"),
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().min(1, "Type is required"),
  capacity: z.number().int().positive("Capacity must be positive").optional(),
  coordinates: z.any().optional(), // JSON object for canvas coordinates
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).optional(),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).optional(),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = z
  .object({
    space_id: z.string().uuid("Invalid space ID"),
    user_id: z.string().uuid("Invalid user ID"),
    start_time: z
      .string()
      .datetime({ offset: true, message: "Invalid start time format" }),
    end_time: z
      .string()
      .datetime({ offset: true, message: "Invalid end time format" }),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const checkAvailabilitySchema = z.object({
  start_time: z
    .string()
    .datetime({ offset: true, message: "Invalid start time format" }),
  end_time: z
    .string()
    .datetime({ offset: true, message: "Invalid end time format" }),
});

// ============================================
// CONFIG SCHEMAS
// ============================================

// Room type - only label required (value auto-generated from label)
export const createRoomTypeSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
});

// Amenity - label required, icon optional
export const createAmenitySchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  icon: z.string().max(50).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: 'Role must be "user" or "admin"' }),
  }),
});

export const toggleRoomStatusSchema = z.object({
  is_active: z.boolean(),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  // Demo mode: allow users to set their own role on registration
  role: z.enum(["user", "admin"]).optional(),
});

// ============================================
// UUID PARAM SCHEMA
// ============================================

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const userIdParamSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
});

// ============================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================

type ValidationTarget = "body" | "query" | "params";

/**
 * Creates validation middleware for a given Zod schema.
 * @param schema - Zod schema to validate against
 * @param target - Where to find the data ('body', 'query', or 'params')
 */
export const validate = <T extends z.ZodSchema>(
  schema: T,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
        return;
      }

      // Replace the request data with the parsed/coerced data
      req[target] = result.data;
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  };
};

import { Router } from "express";
import {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  getFloorStats,
} from "./controllers/floorController";
import {
  saveSpace,
  getSpaces,
  updateSpace,
  deleteSpace,
  getAllSpacesGlobal,
} from "./controllers/spaceController";
import {
  createBooking,
  getBookingsBySpace,
  checkAvailability,
  getBookingsByUser,
  deleteBooking,
  getAllBookingsAdmin,
} from "./controllers/bookingController";
import {
  getRoomTypes,
  createRoomType,
  deleteRoomType,
  getAmenities,
  createAmenity,
  deleteAmenity,
  getUsers,
  updateUserRole,
  toggleRoomStatus,
} from "./controllers/configController";
import { getLogs } from "./controllers/logController";
import { getProfile, updateProfile } from "./controllers/userController";

// Middleware
import { authMiddleware, requireRole } from "./middleware";
import {
  validate,
  createFloorSchema,
  updateFloorSchema,
  createSpaceSchema,
  updateSpaceSchema,
  createBookingSchema,
  checkAvailabilitySchema,
  createRoomTypeSchema,
  createAmenitySchema,
  updateUserRoleSchema,
  toggleRoomStatusSchema,
  updateProfileSchema,
  uuidParamSchema,
  userIdParamSchema,
} from "./validators";

const router = Router();

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
// These routes are for reading data and are accessible without authentication
// This allows the frontend to display data before login if needed

// Floors - Read
router.get("/floors", getFloors);
router.get(
  "/floors/:id/stats",
  validate(uuidParamSchema, "params"),
  getFloorStats
);

// Spaces - Read
router.get("/spaces", getSpaces);
router.get("/admin/spaces", getAllSpacesGlobal);

// Bookings - Read
router.get("/bookings", getBookingsBySpace);
router.get(
  "/bookings/occupied",
  validate(checkAvailabilitySchema, "query"),
  checkAvailability
);

// Config - Read
router.get("/config/room-types", getRoomTypes);
router.get("/config/amenities", getAmenities);

// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================

// Floors - Write (Admin only)
router.post(
  "/floors",
  authMiddleware,
  requireRole(["admin"]),
  validate(createFloorSchema),
  createFloor
);
router.put(
  "/floors/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  validate(updateFloorSchema),
  updateFloor
);
router.delete(
  "/floors/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  deleteFloor
);

// Spaces - Write (Admin only)
router.post(
  "/spaces",
  authMiddleware,
  requireRole(["admin"]),
  validate(createSpaceSchema),
  saveSpace
);
router.put(
  "/spaces/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  validate(updateSpaceSchema),
  updateSpace
);
router.delete(
  "/spaces/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  deleteSpace
);

// Bookings - Write (Authenticated users)
router.post(
  "/bookings",
  authMiddleware,
  validate(createBookingSchema),
  createBooking
);
router.get(
  "/bookings/user/:user_id",
  authMiddleware,
  validate(userIdParamSchema, "params"),
  getBookingsByUser
);
router.delete(
  "/bookings/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  deleteBooking
);

// Admin Bookings
router.get(
  "/admin/bookings",
  authMiddleware,
  requireRole(["admin"]),
  getAllBookingsAdmin
);

// Config - Write (Admin only)
router.post(
  "/config/room-types",
  authMiddleware,
  requireRole(["admin"]),
  validate(createRoomTypeSchema),
  createRoomType
);
router.delete(
  "/config/room-types/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  deleteRoomType
);

// Amenities - Write (Admin only)
router.post(
  "/config/amenities",
  authMiddleware,
  requireRole(["admin"]),
  validate(createAmenitySchema),
  createAmenity
);
router.delete(
  "/config/amenities/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  deleteAmenity
);
router.get("/config/users", authMiddleware, requireRole(["admin"]), getUsers);
router.put(
  "/config/users/:id/role",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  validate(updateUserRoleSchema),
  updateUserRole
);

// Maintenance Toggle (Admin only)
router.put(
  "/config/spaces/:id/status",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  validate(toggleRoomStatusSchema),
  toggleRoomStatus
);

// Profile Routes (Authenticated users - own profile only)
router.get(
  "/profiles/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  getProfile
);
router.put(
  "/profiles/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  validate(updateProfileSchema),
  updateProfile
);

// Logs (Admin only)
router.get("/admin/logs", authMiddleware, requireRole(["admin"]), getLogs);

export default router;

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
  getUsers,
  updateUserRole,
  toggleRoomStatus,
} from "./controllers/configController";
import { getLogs } from "./controllers/logController";
import { getProfile, updateProfile } from "./controllers/userController";

const router = Router();

// Floors
router.get("/floors", getFloors);
router.post("/floors", createFloor);
router.put("/floors/:id", updateFloor);
router.delete("/floors/:id", deleteFloor);
router.get("/floors/:id/stats", getFloorStats);

// Spaces
router.post("/spaces", saveSpace);
router.get("/spaces", getSpaces);
router.put("/spaces/:id", updateSpace);
router.delete("/spaces/:id", deleteSpace);
router.get("/admin/spaces", getAllSpacesGlobal);

// Bookings
router.post("/bookings", createBooking);
router.get("/bookings", getBookingsBySpace);
router.get("/bookings/occupied", checkAvailability); // <--- Add this
router.get("/bookings/user/:user_id", getBookingsByUser); // <--- NEW
router.delete("/bookings/:id", deleteBooking); // <--- NEW
router.get("/admin/bookings", getAllBookingsAdmin);

// Config Routes
router.get("/config/room-types", getRoomTypes);
router.post("/config/room-types", createRoomType);
router.delete("/config/room-types/:id", deleteRoomType);

router.get("/config/users", getUsers);
router.put("/config/users/:id/role", updateUserRole);
router.put("/config/spaces/:id/status", toggleRoomStatus); // New route for maintenance

// --- NEW PROFILE ROUTES ---
router.get("/profiles/:id", getProfile);
router.put("/profiles/:id", updateProfile);

// Logs
router.get("/admin/logs", getLogs);
export default router;

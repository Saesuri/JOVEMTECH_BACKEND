import { Router } from "express";
import { getFloors, createFloor } from "./controllers/floorController";
import {
  saveSpace,
  getSpaces,
  updateSpace,
} from "./controllers/spaceController";
import {
  createBooking,
  getBookingsBySpace,
  checkAvailability,
  getBookingsByUser,
  deleteBooking,
} from "./controllers/bookingController"; // Import

const router = Router();

// Floors
router.get("/floors", getFloors);
router.post("/floors", createFloor);

// Spaces
router.post("/spaces", saveSpace);
router.get("/spaces", getSpaces);
router.put("/spaces/:id", updateSpace);

// Bookings
router.post("/bookings", createBooking);
router.get("/bookings", getBookingsBySpace);
router.get("/bookings/occupied", checkAvailability); // <--- Add this
router.get("/bookings/user/:user_id", getBookingsByUser); // <--- NEW
router.delete("/bookings/:id", deleteBooking); // <--- NEW

export default router;

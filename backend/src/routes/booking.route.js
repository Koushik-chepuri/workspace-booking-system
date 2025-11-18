import express from "express";
import { createBooking, cancelBooking, getAllBookings } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.post("/:id/cancel", cancelBooking);

export default router;

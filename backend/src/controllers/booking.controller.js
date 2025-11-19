import { rooms } from "../models/rooms.js";
import { bookings } from "../models/bookings.js";
import { isOverlapping } from "../utils/time.js";
import { v4 as uuidv4 } from "uuid";
import { calculatePrice } from "../utils/pricing.js"; // NEW CORRECT LOGIC

// ---------------------------
// CREATE BOOKING
// ---------------------------
export const createBooking = (req, res) => {
  try {
    const { roomId, userName, startTime, endTime } = req.body;

    if (!roomId || !userName || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: "startTime must be < endTime" });
    }

    // Max duration: 12 hours
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 12) {
      return res
        .status(400)
        .json({ error: "Bookings cannot exceed 12 hours" });
    }

    // ---------------------------
    // CONFLICT DETECTION
    // ---------------------------
    const existing = bookings.filter(
      (b) => b.roomId === roomId && b.status === "CONFIRMED"
    );

    for (let b of existing) {
      if (
        isOverlapping(
          start,
          end,
          new Date(b.startTime),
          new Date(b.endTime)
        )
      ) {
        return res.status(400).json({
          error: `Room already booked from ${new Date(
            b.startTime
          ).toLocaleTimeString()} to ${new Date(
            b.endTime
          ).toLocaleTimeString()}`,
        });
      }
    }

    // ---------------------------
    // CORRECT PEAK-BOUNDARY-AWARE PRICING
    // ---------------------------
    const totalPrice = calculatePrice(start, end, room.baseRate);

    const newBooking = {
      id: uuidv4(),
      roomId,
      roomName: room.name,
      userName,
      startTime,
      endTime,
      totalPrice,
      status: "CONFIRMED",
    };

    bookings.push(newBooking);
    return res.json(newBooking);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ---------------------------
// CANCEL BOOKING
// ---------------------------
export const cancelBooking = (req, res) => {
  try {
    const { id } = req.params;

    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({ error: "Booking is not active" });
    }

    const now = new Date();
    const start = new Date(booking.startTime);
    const diffHours = (start - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res
        .status(400)
        .json({ error: "Cannot cancel within 2 hours of start time" });
    }

    booking.status = "CANCELLED";

    return res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllBookings = (req, res) => {
  return res.json(bookings);
};

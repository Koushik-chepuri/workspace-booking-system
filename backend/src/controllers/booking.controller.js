import { rooms } from "../models/rooms.js";
import { bookings } from "../models/bookings.js";
import { isOverlapping } from "../utils/time.js";
import { isPeakHour } from "../utils/pricing.js";
import { v4 as uuidv4 } from "uuid";

export const createBooking = (req, res) => {
    try {
    const { roomId, userName, startTime, endTime } = req.body;

    if (!roomId || !userName || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: "startTime must be < endTime" });
    }

    // Duration check: max 12 hours
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 12) {
      return res.status(400).json({ error: "Bookings cannot exceed 12 hours" });
    }

    // Conflict detection
    const existing = bookings.filter(b => 
      b.roomId === roomId && 
      b.status === "CONFIRMED"
    );

    for (let b of existing) {
      if (isOverlapping(start, end, new Date(b.startTime), new Date(b.endTime))) {
        return res.status(400).json({
          error: `Room already booked from ${new Date(b.startTime).toLocaleTimeString()} to ${new Date(b.endTime).toLocaleTimeString()}`
        });
      }
    }

    // Pricing logic
    let total = 0;
    let cursor = new Date(start);

    while (cursor < end) {
      const next = new Date(cursor.getTime() + 60 * 60 * 1000); // +1 hour
      const isPeak = isPeakHour(cursor);

      const hourlyRate = isPeak ? room.baseRate * 1.5 : room.baseRate;
      total += hourlyRate;

      cursor = next;
    }

    const newBooking = {
      id: uuidv4(),
      roomId,
      userName,
      startTime,
      endTime,
      totalPrice: total,
      status: "CONFIRMED"
    };

    bookings.push(newBooking);

    return res.json(newBooking);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const cancelBooking = (req, res) => {
    try {
    const { id } = req.params;

    const booking = bookings.find(b => b.id === id);

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
      return res.status(400).json({ error: "Cannot cancel within 2 hours of startTime" });
    }

    booking.status = "CANCELLED";

    return res.json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllBookings = (req, res) => {
  res.json(bookings);
};

import { rooms } from "../models/rooms.js";
import { bookings } from "../models/bookings.js";

export const getAnalytics = (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to dates required" });
    }

    const startRange = new Date(from);
    const endRange = new Date(to);
    endRange.setHours(23, 59, 59, 999); 

    const confirmed = bookings.filter(b => {
      if (b.status !== "CONFIRMED") return false;

      const st = new Date(b.startTime);

      return st >= startRange && st <= endRange;
    });

    const result = rooms.map(room => {
      const roomBookings = confirmed.filter(b => b.roomId === room.id);

      let totalHours = 0;
      let totalRevenue = 0;

      roomBookings.forEach(b => {
        const st = new Date(b.startTime);
        const et = new Date(b.endTime);
        const hours = (et - st) / (1000 * 60 * 60);

        totalHours += hours;
        totalRevenue += b.totalPrice;
      });

      return {
        roomId: room.id,
        roomName: room.name,
        totalHours,
        totalRevenue
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


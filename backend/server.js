import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

import bookingRoutes from "./src/routes/booking.route.js";
import roomRoutes from "./src/routes/room.route.js";
import analyticsRoutes from "./src/routes/analytics.route.js";

app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

import express from "express";
import cors from "cors";
import bookingRoutes from "./src/routes/booking.route.js";
import roomRoutes from "./src/routes/room.route.js";
import analyticsRoutes from "./src/routes/analytics.route.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://workspace-booking-system-coral.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

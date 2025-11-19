import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import RoomCard from "../components/RoomCard";
import "../styling/RoomPage.css";

export default function RoomsPage() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data));
  }, []);

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rooms-page">

      {/* 🔥 ADMIN NAV BUTTON */}
      <button
        className="admin-nav-btn"
        onClick={() => navigate("/admin")}
      >
        ⚙ Admin
      </button>

      {/* ---- HEADER ---- */}
      <div className="rooms-header">
        <h1 className="rooms-title">Available Rooms</h1>
        <p className="rooms-subtitle">
          Pick a room, check the price, and schedule your meeting.
        </p>
      </div>

      {/* ---- SEARCH BAR ---- */}
      <div className="rooms-search">
        <input
          type="text"
          placeholder="Search rooms (e.g., Cabin, Conference)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---- ROOM GRID ---- */}
      <div className="rooms-grid">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}

        {filteredRooms.length === 0 && (
          <div className="rooms-empty">No rooms found.</div>
        )}
      </div>

      {/* <button
        className="rooms-floating-btn"
        onClick={() => navigate("/book")}
      >
        + New Booking
      </button> */}
    </div>
  );
}

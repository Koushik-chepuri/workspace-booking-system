import { useNavigate } from "react-router-dom";
import "../styling/RoomCard.css";

export default function RoomCard({ room }) {
  const navigate = useNavigate();

  const goToBooking = () => {
    navigate(`/book?roomId=${room.id}`);
  };

  return (
    <div className="room-card">
      
      {/* --- TOP IMAGE --- */}
      <div className="room-image">
        <img src={room.image || "/default-room.jpg"} alt={room.name} />
      </div>

      {/* --- CONTENT --- */}
      <div className="room-content">

        <div className="room-card-header">
          <h3 className="room-name">{room.name}</h3>
          <div className="room-rate">₹{room.baseRate}/hr</div>
        </div>

        <div className="room-capacity">
          {/* <span className="capacity-label">Capacity -</span> */}
          <span className="capacity-value">{room.capacity} people</span>
        </div>

        {room.features.slice(0, 4).map((f, idx) => {
        const icon = f.trim().split(" ")[0];         // first part → emoji
        const label = f.trim().split(" ").slice(1).join(" "); // rest → text

        return (
            <div key={idx} className="feature-item">
            <span className="feature-icon">{icon}</span>
            <span className="feature-label">{label}</span>
            </div>
        );
        })}

        <div className="room-footer">
          <button className="room-book-btn" onClick={goToBooking}>
            Book Now
          </button>
        </div>

      </div>

    </div>
  );
}

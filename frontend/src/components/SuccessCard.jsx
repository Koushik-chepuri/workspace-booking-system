import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styling/SuccessCard.css";

export default function SuccessCard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // No state? User came directly → send home
  useEffect(() => {
    if (!state) navigate("/");
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          navigate("/");
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, []);

  if (!state) return null;

  const { room, form, totalCost, bookingId } = state;

  return (
    <div className="success-wrapper">
      <div className="success-card">

        <h2 className="success-title">🎉 Booking Confirmed!</h2>
        <p className="success-sub">Your room is successfully booked.</p>

        <div className="success-room">
          <img src={room.image} alt="" />
          <div>
            <h3>{room.name}</h3>
            <p>₹{room.baseRate}/hr — {room.capacity} people</p>
          </div>
        </div>

        <div className="success-details-card">

        <div className="success-row">
            <span className="label">Booked by</span>
            <span className="value">{form.userName}</span>
        </div>

        <div className="success-row">
            <span className="label">From</span>
            <span className="value">{new Date(form.startTime).toLocaleString()}</span>
        </div>

        <div className="success-row">
            <span className="label">To</span>
            <span className="value">{new Date(form.endTime).toLocaleString()}</span>
        </div>

        <div className="success-row total">
            <span className="label">Total Cost</span>
            <span className="value">₹{totalCost}</span>
        </div>

        <div className="success-row">
            <span className="label">Booking ID</span>
            <span className="value id">{bookingId}</span>
        </div>

        </div>

        <p className="redirect">
          Redirecting to homepage in <strong>{countdown}</strong>s…
        </p>

        <button className="home-btn" onClick={() => navigate("/")}>
          Go to Homepage
        </button>

      </div>
    </div>
  );
}

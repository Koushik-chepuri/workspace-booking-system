import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styling/SuccessCard.css";

export default function SuccessCard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(10);
  const [stopped, setStopped] = useState(false);

  const timerRef = useRef(null); 

  useEffect(() => {
    if (!state) navigate("/");
  }, []);

  useEffect(() => {
    if (stopped) return;

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          navigate("/");
        }
        return c - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timerRef.current);
  }, [stopped]);

  if (!state) return null;

  const { room, form, totalCost, bookingId } = state;

  return (
    <div className="success-wrapper">
      <div className="success-card">

        <div className="success-check">
          <svg viewBox="0 0 52 52">
            <circle className="check-circle" cx="26" cy="26" r="24" />
            <path className="check" d="M14 27 l8 8 l16 -16" />
          </svg>
        </div>

        <h2 className="success-title">Booking Confirmed!</h2>

        <div className="success-box compact-box">
          <div className="success-room-inline small">
            <img src={room.image} alt="" />
            <div>
              <h3>{room.name}</h3>
              <p>₹{room.baseRate}/hr • {room.capacity} people</p>
            </div>
          </div>

          <ul className="success-list small">
            <li className="row">
              <span className="label">Customer</span>
              <span className="value">{form.userName}</span>
            </li>
            <li className="row">
              <span className="label">From</span>
              <span className="value">{new Date(form.startTime).toLocaleString()}</span>
            </li>
            <li className="row">
              <span className="label">To</span>
              <span className="value">{new Date(form.endTime).toLocaleString()}</span>
            </li>
            <li className="row price-row">
              <span className="label">Total Cost</span>
              <span className="value price">₹{totalCost}</span>
            </li>
            <li className="row id-row">
              <span className="label">Booking ID</span>
              <span className="value id">{bookingId.slice(0, 8).toUpperCase()}…</span>
            </li>
          </ul>
        </div>

        <p className="redirect">Redirecting in {countdown}s…</p>

        <button
          className="home-btn"
          onClick={() => {
            setStopped(true);
            clearInterval(timerRef.current); 
            timerRef.current = null;
            navigate("/");
          }}
        >
          Go to Homepage
        </button>

      </div>
    </div>
  );
}

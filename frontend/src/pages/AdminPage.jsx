import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  const loadBookings = () => api.get("/bookings").then(res => setBookings(res.data));
  const loadAnalytics = () => api.get("/analytics?from=2025-11-01&to=2025-11-30").then(res => setAnalytics(res.data));

  const cancelBooking = id =>
    api.post(`/bookings/${id}/cancel`).then(loadBookings);

  useEffect(() => {
    loadBookings();
    loadAnalytics();
  }, []);

  return (
    <div className="page">
      <h1>Admin</h1>

      <h2>Bookings</h2>
      <ul>
        {bookings.map(b => (
          <li key={b.id}>
            {b.userName} — {b.roomId} — {b.status}
            {b.status === "CONFIRMED" && (
              <button onClick={() => cancelBooking(b.id)}>Cancel</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Analytics</h2>
      <pre>{JSON.stringify(analytics, null, 2)}</pre>
    </div>
  );
}

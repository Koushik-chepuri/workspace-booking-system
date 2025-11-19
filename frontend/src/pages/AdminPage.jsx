import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import "../styling/AdminPage.css";

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [toast, setToast] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [range, setRange] = useState({
    from: today,
    to: today,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadBookings = () =>
    api.get("/bookings").then((res) => setBookings(res.data));

  const loadAnalytics = async () => {
    try {
      const res = await api.get(`/analytics?from=${range.from}&to=${range.to}`);
      setAnalytics(res.data);
    } catch {
      showToast("Analytics error");
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`);
      showToast("Booking cancelled");
      loadBookings();
    } catch (err) {
      showToast(err.response?.data?.error || "Cancellation failed");
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="admin-wrapper">
      <button className="admin-home-btn" onClick={() => navigate("/")}>
        ⬅ Home
      </button>

      {toast && <div className="toast">{toast}</div>}

      <h1 className="admin-title">Admin Dashboard</h1>

      {/* NAVIGATION TABS */}
      <div className="admin-tabs">
        <button
          className={tab === "bookings" ? "active" : ""}
          onClick={() => setTab("bookings")}
        >
          📘 Bookings
        </button>

        <button
          className={tab === "analytics" ? "active" : ""}
          onClick={() => setTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {/* BOOKINGS TAB */}
      {tab === "bookings" && (
        <div className="admin-section">
          <h2>All Bookings</h2>

          {/* NO BOOKINGS MESSAGE */}
          {bookings.length === 0 && (
            <p className="empty-msg">No bookings currently.</p>
          )}

          {bookings.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Room</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.userName}</td>
                    <td>{b.roomName}</td> {/* FIXED */}
                    <td>{new Date(b.startTime).toLocaleString()}</td>
                    <td>{new Date(b.endTime).toLocaleString()}</td>
                    <td>₹{b.totalPrice}</td>
                    <td
                      className={
                        b.status === "CANCELLED"
                          ? "status-cancelled"
                          : "status-confirmed"
                      }
                    >
                      {b.status}
                    </td>
                    <td>
                      {b.status === "CONFIRMED" ? (
                        <button
                          className="cancel-btn"
                          onClick={() => cancelBooking(b.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div className="admin-section">
          <h2>Analytics</h2>

          <div className="date-filters analytics-date-ui">
            <input
              type="date"
              className="date-input"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
            <input
              type="date"
              className="date-input"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
            <button className="fetch-btn" onClick={loadAnalytics}>
              Fetch
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Total Hours</th>
                <th>Total Revenue</th>
              </tr>
            </thead>

            <tbody>
              {analytics.map((a) => (
                <tr key={a.roomId}>
                  <td>{a.roomName}</td>
                  <td>{a.totalHours.toFixed(1)}</td>
                  <td>₹{a.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useSearchParams } from "react-router-dom";
import "../styling/BookingForm.css";

// ---------- UTILITIES ----------
function getRoundedStartTime() {
  const now = new Date();
  now.setSeconds(0, 0);

  const m = now.getMinutes();
  if (m === 0 || m === 30) return now;

  if (m < 30) now.setMinutes(30);
  else {
    now.setMinutes(0);
    now.setHours(now.getHours() + 1);
  }
  return now;
}

function formatLocalInput(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);

  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function getMinDateTime() {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  const pad = (n) => (n < 10 ? "0" + n : n);

  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function isPastSlot(startDate) {
  return startDate.getTime() < Date.now();
}

const PEAK_HOURS = [
  { start: 10, end: 13 },
  { start: 16, end: 19 },
];

function isPeakHour(d) {
  const hour = d.getHours();
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return PEAK_HOURS.some(range => hour >= range.start && hour < range.end);
}

// ---------- TIMELINE BLOCKS ----------
function calculatePriceBlocks(startDate, endDate, baseRate) {
  let cursor = new Date(startDate);
  const out = [];

  while (cursor < endDate) {
    const next = new Date(cursor.getTime() + 60 * 60 * 1000);
    const upper = next > endDate ? endDate : next;

    const hrs = (upper - cursor) / (1000 * 60 * 60);
    const peak = isPeakHour(cursor);
    const rate = peak ? baseRate * 1.5 : baseRate;

    out.push({
      start: new Date(cursor),
      end: new Date(upper),
      hours: hrs,
      isPeak: peak,
      rate,
      cost: rate * hrs,
    });

    cursor = next;
  }
  return out;
}

export default function BookingForm() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rate, setRate] = useState(null);
  const [priceBlocks, setPriceBlocks] = useState([]);

  const [form, setForm] = useState({
    roomId: "",
    userName: "",
    startTime: "",
    endTime: "",
  });

  const [duration, setDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [result, setResult] = useState("");

  const [params] = useSearchParams();
  const roomFromQuery = params.get("roomId");
  
    const suggestedSlots = [
        {
            label: "+1 hour",
            getTimes: () => {
            const start = new Date(form.startTime);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            return { start, end };
            }
        },

        {
            label: "10–11 AM",
            getTimes: () => {
            const d = new Date();
            d.setHours(10, 0, 0, 0);
            return { start: d, end: new Date(d.getTime() + 60 * 60 * 1000) };
            }
        },

        {
            label: "Tomorrow same time",
            getTimes: () => {
            const start = new Date(form.startTime);
            start.setDate(start.getDate() + 1);
            return { start, end: new Date(start.getTime() + 60 * 60 * 1000) };
            }
        },

        {
            label: "After lunch (2–3 PM)",
            getTimes: () => {
            const d = new Date();
            d.setHours(14, 0, 0, 0);
            return { start: d, end: new Date(d.getTime() + 60 * 60 * 1000) };
            }
        },

        {
            label: "5–6 PM — Peak!",
            isPeak: true,
            getTimes: () => {
            const d = new Date();
            d.setHours(17, 0, 0, 0);
            return { start: d, end: new Date(d.getTime() + 60 * 60 * 1000) };
            }
        }
        ];
  // ---------- FETCH ROOMS ----------
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/rooms");
        setRooms(res.data);

        if (roomFromQuery) {
          const found = res.data.find(r => r.id === roomFromQuery);
          if (found) {
            setSelectedRoom(found);
            setForm(f => ({ ...f, roomId: found.id }));
            setRate(found.baseRate);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    load();
  }, []);

  // ---------- APPLY SMART DEFAULT START/END ----------
  useEffect(() => {
    if (!selectedRoom) return;

    const start = getRoundedStartTime();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setForm(f => ({
      ...f,
      startTime: formatLocalInput(start),
      endTime: formatLocalInput(end),
    }));
  }, [selectedRoom]);

  // ---------- ROOM SELECT ----------
  const handleRoomSelect = e => {
    const id = e.target.value;
    const room = rooms.find(r => r.id === id);
    setSelectedRoom(room);
    setRate(room?.baseRate || null);
    setForm(f => ({ ...f, roomId: id }));
  };

  // ---------- INPUT CHANGE ----------
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------- PRICE CALC ----------
  useEffect(() => {
    if (!form.startTime || !form.endTime || !rate) return;

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (end <= start) return;

    const blocks = calculatePriceBlocks(start, end, rate);
    setPriceBlocks(blocks);

    const hrs = blocks.reduce((a, b) => a + b.hours, 0);
    const total = blocks.reduce((a, b) => a + b.cost, 0);

    setDuration(hrs);
    setTotalCost(Math.round(total));
  }, [form.startTime, form.endTime, rate]);

  // ---------- SMOOTH FEEDBACK ----------
  function animateGlow() {
    document.querySelectorAll(".input").forEach(input => {
      input.classList.add("flash");
      setTimeout(() => input.classList.remove("flash"), 300);
    });
  }

  // ---------- QUICK DURATION BUTTONS ----------
  function adjustEnd(mins) {
    const start = new Date(form.startTime);
    const end = new Date(start.getTime() + mins * 60 * 1000);
    setForm(f => ({ ...f, endTime: formatLocalInput(end) }));
    animateGlow();
  }

  // ---------- USE SUGGESTED SLOT ----------
  function applySlot(start, end) {
    setForm(f => ({
      ...f,
      startTime: formatLocalInput(start),
      endTime: formatLocalInput(end),
    }));

    animateGlow();

    document.querySelector(".booking-form-row")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // ---------- SUBMIT ----------
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/bookings", form);
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setResult(JSON.stringify(err.response?.data || { error: "Something went wrong" }, null, 2));
    }
  }

  return (
    <div className="booking-form-wrapper">
      <div className="booking-form-card fade-in">

        {/* ROOM PREVIEW */}
        {selectedRoom && (
          <div className="room-preview">
            <img src={selectedRoom.image} alt="" />
            <div className="room-preview-info">
              <h3>{selectedRoom.name}</h3>
              <p>₹{selectedRoom.baseRate}/hr • {selectedRoom.capacity} people</p>
            </div>
          </div>
        )}

        <h2 className="booking-title">Room Booking</h2>
        <p className="booking-subtitle">Choose your slot — pricing updates instantly.</p>

        {/* PEAK WARNING */}
        {priceBlocks.length > 0 && (() => {
          const hasPeak = priceBlocks.some(b => b.isPeak);
          const allPeak = hasPeak && priceBlocks.every(b => b.isPeak);
          if (!hasPeak) return null;

          if (allPeak)
            return <div className="peak-warning">⚠ Entire slot is peak hours — 50% increase applied.</div>;

          return <div className="peak-warning partial">⚠ Some of your slot overlaps with peak hours.</div>;
        })()}

        <form className="booking-form" onSubmit={handleSubmit}>

          {/* ROOM + NAME */}
          <div className="booking-form-row">
            <div className="booking-field">
              <label>Select Room</label>
              <select className="input" required value={form.roomId} onChange={handleRoomSelect}>
                <option value="">-- Select Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} (₹{r.baseRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-field">
              <label>Your Name</label>
              <input
                className="input"
                placeholder="e.g. Tony Stark"
                name="userName"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* START + END */}
          <div className="booking-form-row">
            <div className="booking-field">
              <label>Start Time</label>
              <input
                type="datetime-local"
                className="input"
                name="startTime"
                min={getMinDateTime()}
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-field">
              <label>End Time</label>
              <input
                type="datetime-local"
                className="input"
                name="endTime"
                min={form.startTime}
                value={form.endTime}
                onChange={handleChange}
                required
              />

              {/* QUICK DURATION SHORTCUTS */}
              {/* <div className="quick-duration">
                <button type="button" onClick={() => adjustEnd(30)}>+30m</button>
                <button type="button" onClick={() => adjustEnd(60)}>+1h</button>
                <button type="button" onClick={() => adjustEnd(120)}>+2h</button>
                <button type="button" onClick={() => adjustEnd(180)}>+3h</button>
              </div> */}
            </div>
          </div>

          {/* SUGGESTED SLOTS */}
          <div className="suggested-slots">
            <h4>Suggested Slots</h4>

            <div className="slot-chips">
            {suggestedSlots.map((slot, index) => {
                const { start, end } = slot.getTimes();
                const disabled = isPastSlot(start);

                return (
                <button
                    key={index}
                    type="button"
                    disabled={disabled}
                    className={
                    disabled
                        ? "slot-disabled"
                        : slot.isPeak
                        ? "peak-chip"
                        : ""
                    }
                    onClick={() => !disabled && applySlot(start, end)}
                >
                    {slot.label}
                </button>
                );
            })}
            </div>

          </div>

          {/* PRICE BOX */}
          {duration > 0 && (
            <div className="price-box">
              <h4>Estimated Price</h4>
              <div className="price-main">₹{totalCost}</div>
              <p>{duration.toFixed(1)} hrs total</p>
            </div>
          )}

          {/* TIMELINE */}
          {priceBlocks.length > 0 && (
            <div className="timeline-wrapper">
              <h4>Timeline</h4>
              <div className="timeline-bar">
                {priceBlocks.map((b, i) => (
                  <div
                    key={i}
                    className={`timeline-block ${b.isPeak ? "peak" : "normal"}`}
                    title={`${b.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${b.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${b.isPeak ? "Peak ×1.5" : "Normal"})`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* BREAKDOWN */}
          {priceBlocks.length > 0 && (
            <div className="price-breakdown">
              <h4>Price Breakdown</h4>
              {priceBlocks.map((b, i) => (
                <div key={i} className={`pb-row ${b.isPeak ? "peak" : ""}`}>
                  <div className="pb-time">
                    {b.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {b.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="pb-rate">₹{b.rate}/hr</div>
                  <div className="pb-cost">₹{b.cost.toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}

          <button className="booking-submit">Confirm Booking</button>
        </form>

        {/* API RESPONSE */}
        {result && (
          <div className="booking-output">
            <div className="output-label">API Response</div>
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

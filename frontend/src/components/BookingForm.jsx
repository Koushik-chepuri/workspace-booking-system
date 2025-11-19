import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styling/BookingForm.css"; 

// ---------- UTILITIES ----------
function getRoundedStartTime() {
  const now = new Date();
  now.setSeconds(0, 0);

  const m = now.getMinutes();
  if (m === 0 || m === 30) now.setMinutes(30);
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

// Validation Constant
const MAX_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export default function BookingForm() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rate, setRate] = useState(null);
  const [priceBlocks, setPriceBlocks] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("idle"); 
  const [bookingDetails, setBookingDetails] = useState(null);
  const [countdown, setCountdown] = useState(10);

  const [form, setForm] = useState({
    roomId: "",
    userName: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({}); 

  const [duration, setDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [result, setResult] = useState("");
  
  const [isDurationExceeded, setIsDurationExceeded] = useState(false); 

  const [params] = useSearchParams();
  const roomFromQuery = params.get("roomId");
  
  useEffect(() => {
    if (bookingStatus !== "success") return;

    const interval = setInterval(() => {
        setCountdown((c) => {
        if (c <= 1) {
            clearInterval(interval);
            window.location.href = "/";
        }
        return c - 1;
        });
    }, 1000);

    return () => clearInterval(interval);
    }, [bookingStatus]);

  const getCurrentDatePart = () => {
    if (!form.startTime) return new Date();
    const d = new Date(form.startTime);
    d.setHours(0, 0, 0, 0); 
    return d;
  };

  const suggestedSlots = [
    {
      label: "+1 hour",
      getTimes: () => {
        if (!form.startTime || !form.endTime) return { start: null, end: null };
        
        const start = new Date(form.startTime);
        const end = new Date(form.endTime);
        const currentDurationMs = end.getTime() - start.getTime();

        const newStart = new Date(start.getTime() + 60 * 60 * 1000); 
        const newEnd = new Date(newStart.getTime() + currentDurationMs);

        return { start: newStart, end: newEnd };
      }
    },

    {
      label: "10–11 AM",
      getTimes: (currentDatePart) => {
        const d = new Date(currentDatePart);
        d.setHours(10, 0, 0, 0);
        return { start: d, end: new Date(d.getTime() + 60 * 60 * 1000) };
      }
    },

    {
      label: "Tomorrow same time",
      getTimes: () => {
        if (!form.startTime) return { start: null, end: null };
        const start = new Date(form.startTime);
        start.setDate(start.getDate() + 1);
        return { start, end: new Date(start.getTime() + 60 * 60 * 1000) };
      }
    },

    {
      label: "After lunch (2–3 PM)",
      getTimes: (currentDatePart) => {
        const d = new Date(currentDatePart);
        d.setHours(14, 0, 0, 0);
        return { start: d, end: new Date(d.getTime() + 60 * 60 * 1000) };
      }
    },

    {
      label: "5–6 PM — Peak!",
      isPeak: true,
      getTimes: (currentDatePart) => {
        const d = new Date(currentDatePart);
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
    if (!selectedRoom || form.startTime) return; 

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
    setErrors(e => ({ ...e, roomId: "" })); 
  };

  // ---------- INPUT CHANGE ----------
  const handleChange = e => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    
    // Clear the error for the changed field
    setErrors(e => ({ ...e, [name]: "" })); 

    if (name === "startTime" && form.endTime) {
        const newStart = new Date(value);
        const end = new Date(form.endTime);

        if (end <= newStart || isNaN(end.getTime())) {
            const newEnd = new Date(newStart.getTime() + 30 * 60 * 1000);
            setForm(f => ({ ...f, startTime: value, endTime: formatLocalInput(newEnd) }));
        }
    }
  };

  // ---------- START TIME BLUR VALIDATION ----------
  const handleTimeBlur = (e) => {
    const { name, value } = e.target;
    const start = new Date(value);
    
    if (name === "startTime" && isPastSlot(start)) {
        const minTime = getMinDateTime().substring(11);
        setErrors(e => ({ 
            ...e, 
            startTime: `Start time cannot be in the past. Choose a time after ${minTime}.` 
        }));
    }
  };
  
  // ---------- END TIME BLUR VALIDATION (NEW HANDLER) ----------
  const handleEndBlur = (e) => {
    const start = new Date(form.startTime);
    const end = new Date(e.target.value);
    
    if (form.startTime && end <= start) {
        setErrors(e => ({ 
            ...e, 
            endTime: "End time must be after the start time." 
        }));
    } else if (form.startTime) {
        const durationMs = end.getTime() - start.getTime();
        if (durationMs > MAX_DURATION_MS) {
            setErrors(e => ({ 
                ...e, 
                endTime: "Booking duration cannot exceed 12 hours." 
            }));
        }
    }
  };
  // --------------------------------------------------------

  // ---------- PRICE CALC & VALIDATION EFFECT ----------
  useEffect(() => {
    if (!form.startTime || !form.endTime || !rate) {
        setPriceBlocks([]);
        setDuration(0);
        setTotalCost(0);
        setIsDurationExceeded(false); 
        return;
    }

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    
    if (end <= start) {
        setPriceBlocks([]);
        setDuration(0);
        setTotalCost(0);
        setIsDurationExceeded(false); 
        return;
    }

    const durationMs = end.getTime() - start.getTime();
    const currentDurationHours = durationMs / (1000 * 60 * 60);

    if (durationMs > MAX_DURATION_MS) {
        setPriceBlocks([]);
        setDuration(currentDurationHours); 
        setTotalCost(0); 
        setIsDurationExceeded(true); 
        return;
    }

    // SUCCESS CASE
    const blocks = calculatePriceBlocks(start, end, rate);
    setPriceBlocks(blocks);

    const hrs = blocks.reduce((a, b) => a + b.hours, 0);
    const total = blocks.reduce((a, b) => a + b.cost, 0);

    setDuration(hrs);
    setTotalCost(Math.round(total));
    setIsDurationExceeded(false); 
  }, [form.startTime, form.endTime, rate]);

  // ---------- SMOOTH FEEDBACK ----------
  function animateGlow() {
    document.querySelectorAll(".input").forEach(input => {
      input.classList.add("flash");
      setTimeout(() => input.classList.remove("flash"), 300);
    });
  }

  // ---------- QUICK DURATION BUTTONS (Extension Logic) ----------
  function adjustEnd(mins) {
    if (!form.endTime) return; 

    const end = new Date(form.endTime);
    const newEnd = new Date(end.getTime() + mins * 60 * 1000);
    const start = new Date(form.startTime);
    
    if ((newEnd.getTime() - start.getTime()) > MAX_DURATION_MS) {
        setErrors(e => ({ ...e, endTime: "Extending duration exceeds the 12-hour limit." }));
        return;
    }

    setForm(f => ({ ...f, endTime: formatLocalInput(newEnd) }));
    setErrors(e => ({ ...e, endTime: "" })); 
    animateGlow();
  }

  // ---------- USE SUGGESTED SLOT ----------
  function applySlot(start, end) {
    setForm(f => ({
      ...f,
      startTime: formatLocalInput(start),
      endTime: formatLocalInput(end),
    }));

    setErrors({}); 
    animateGlow();

    document.querySelector(".booking-form-row")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // ---------- FORM VALIDATION (PERFECT VALIDATION) ----------
  function validateForm() {
    const newErrors = {};
    const { roomId, userName, startTime, endTime } = form;

    if (!roomId) newErrors.roomId = "Please select a room.";
    if (!userName.trim()) newErrors.userName = "Please enter your name.";

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!startTime || isNaN(start.getTime())) {
      newErrors.startTime = "Please select a valid start time.";
    } else if (isPastSlot(start)) { 
      const minTime = getMinDateTime().substring(11);
      newErrors.startTime = `Start time cannot be in the past. Choose a time after ${minTime}.`;
    }

    if (!endTime || isNaN(end.getTime())) {
      newErrors.endTime = "Please select a valid end time.";
    } else if (end <= start) {
      newErrors.endTime = "End time must be after the start time.";
    } else {
        const durationMs = end.getTime() - start.getTime();
        if (durationMs > MAX_DURATION_MS) {
            newErrors.endTime = "Booking duration cannot exceed 12 hours.";
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  // ---------- SUBMIT ----------
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setBookingStatus("loading");
    setResult(""); // Hide old JSON

    try {
        const res = await api.post("/bookings", form);

        setBookingStatus("loading");

        setTimeout(() => {
        navigate("/booking-success", {
            state: {
            room: selectedRoom,
            form,
            totalCost,
            bookingId: res.data.id,
            },
        });
        }, 1000); 

        setTimeout(() => {
        window.location.href = "/";
        }, 10000);

    } catch (err) {
        setBookingStatus("idle");
        setResult(JSON.stringify(err.response?.data || { error: "Something went wrong" }, null, 2));
    }
    }


  const hasFormErrors = Object.keys(errors).length > 0;
  const isFormValid =
  form.roomId &&
  form.userName.trim().length > 0 &&
  form.startTime &&
  form.endTime &&
  !isDurationExceeded &&
  duration > 0 &&
  Object.values(errors).every((msg) => msg === "");


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
        
        {bookingStatus === "loading" && (
        <div className="booking-loader">
            <div className="spinner"></div>
            <p>Processing your booking…</p>
        </div>
        )}
   
        {bookingStatus !== "success" && (
        <form className="booking-form" onSubmit={handleSubmit}>


          {/* ROOM + NAME */}
          <div className="booking-form-row">
            <div className="booking-field">
              <label>Select Room</label>
              <select 
                className={`input ${errors.roomId ? 'input-error' : ''}`}
                required 
                value={form.roomId} 
                onChange={handleRoomSelect}
              >
                <option value="">-- Select Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} (₹{r.baseRate}/hr)
                  </option>
                ))}
              </select>
              {errors.roomId && <div className="error-message">{errors.roomId}</div>} 
            </div>

            <div className="booking-field">
              <label>Your Name</label>
              <input
                className={`input ${errors.userName ? 'input-error' : ''}`}
                placeholder="e.g. Tony Stark"
                name="userName"
                required
                value={form.userName}
                onChange={handleChange}
              />
              {errors.userName && <div className="error-message">{errors.userName}</div>} 
            </div>
          </div>

          {/* START + END */}
          <div className="booking-form-row">
            <div className="booking-field">
              <label>Start Time</label>
              <input
                type="datetime-local"
                className={`input ${errors.startTime ? 'input-error' : ''}`}
                name="startTime"
                min={getMinDateTime()} 
                value={form.startTime}
                onChange={handleChange}
                onBlur={handleTimeBlur}
                required
              />
              {errors.startTime && <div className="error-message">{errors.startTime}</div>} 
            </div>

            <div className="booking-field">
              <label>End Time</label>
              <input
                type="datetime-local"
                className={`input ${errors.endTime ? 'input-error' : ''}`}
                name="endTime"
                min={form.startTime}
                value={form.endTime}
                onChange={handleChange}
                onBlur={handleEndBlur} 
                required
              />
              {errors.endTime && <div className="error-message">{errors.endTime}</div>} 

              {/* QUICK DURATION SHORTCUTS */}
              <div className="quick-duration">
                <button type="button" onClick={() => adjustEnd(30)}>+30m</button>
                <button type="button" onClick={() => adjustEnd(60)}>+1h</button>
                <button type="button" onClick={() => adjustEnd(120)}>+2h</button>
                <button type="button" onClick={() => adjustEnd(180)}>+3h</button>
              </div>
            </div>
          </div>

          {/* SUGGESTED SLOTS */}
          <div className="suggested-slots">
            <h4>Suggested Slots</h4>

            <div className="slot-chips">
            {suggestedSlots.map((slot, index) => {
                const currentDatePart = getCurrentDatePart();
                const { start, end } = slot.getTimes(currentDatePart); 
                const disabled = !start || isPastSlot(start); 

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
              
              {isDurationExceeded ? (
                <div className="price-main exceeded-limit">
                    ⚠ Limit Exceeded
                </div>
              ) : (
                <div className="price-main">
                    ₹{totalCost}
                </div>
              )}
              
              <p>{duration.toFixed(1)} hrs total</p>
              
              {isDurationExceeded && 
                <p className="warning-text">Max booking time is 12 hours.</p>}

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

          <button className="booking-submit" disabled={!isFormValid}>Confirm Booking</button>
        </form> )}

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
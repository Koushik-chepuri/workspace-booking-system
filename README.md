🚀 Workspace Booking System

A clean, fast, fully-functional workspace room booking platform with dynamic pricing, conflict detection, admin analytics, and a polished UX — built as part of an engineering assignment.

Live Deployments:
Frontend (Vercel): https://workspace-booking-system-coral.vercel.app
Backend (Render): https://workspace-booking-system-743i.onrender.com/api

✨ Features
🧑‍💼 User Features

Browse workspace rooms with rates, capacity, and features.

Book rooms with:
Start/End time selection
Dynamic price calculation
Peak hour pricing
Conflict detection
Instant booking success page with:
Room details
Customer details
Pricing summary
Auto-redirect + manual button
Toast notifications for all actions (success/error).

🛠️ Admin Features

View all bookings with:
Status badges
Room names
Start and end times
Total pricing
Cancellation controls
Cancel bookings with 2-hour restriction rule.

Analytics dashboard:
Select from and to date

Room-wise:
Total hours booked
Total revenue
Clean table layout
Admin-only toast notifications
Quick navigation back to homepage

💰 Pricing Logic

Dynamic pricing includes:

⭐ Peak Hours
Morning peak: 10 AM → 1 PM
Evening peak: 4 PM → 7 PM

Peak pricing is applied pro-rated, even partially.

⭐ Implementation Highlights

Pricing considers:
Overlaps with peak hours
Partial segments
Remaining off-peak hours
Clean utility function: calculatePrice(start, end, baseRate)
Backend uses authoritative pricing to prevent FE manipulation.

🧠 Booking Rules
Room cannot be booked if ANY overlap exists with a confirmed booking.
Max booking duration: 12 hours
End time must be > start time.
Cancellation allowed only if start time is at least 2 hours away.
All data is stored in-memory (bookings[]) per assignment requirement.

🧱 Tech Stack
**Frontend**
React + Vite
Axios
React Router
Toast notifications
Custom UI/UX
Vercel deployment

**Backend**
Node.js
Express
UUID for booking IDs

**Custom utilities:**
pricing.js
time.js
In-memory “database”
Render deployment


▶️ Running Locally
Backend
cd backend
npm install
node server.js


Backend runs on:
http://localhost:5000/api

Frontend
cd frontend
npm install
npm run dev


Frontend runs on:
http://localhost:5173

🚢 Deployment
Frontend → Vercel

Auto-build via Vite

Requires VITE_API_BASE environment variable

Output served as static site

Backend → Render

Build command: npm install

Start command: node server.js

CORS configured for:

localhost:5173

Deployed Vercel domain (no slashes!)

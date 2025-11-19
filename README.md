🚀 Workspace Booking System

A complete workspace room booking platform with dynamic pricing, conflict detection, admin analytics, and a polished UI — built as part of a software engineering assignment.

Live Deployments

Frontend (Vercel): https://workspace-booking-system-coral.vercel.app

Backend (Render): https://workspace-booking-system-743i.onrender.com/api

✨ Features
👤 User

Browse workspace rooms with rate, capacity, and features.

Book rooms with:

Start/end time selection

Dynamic pricing (peak + non-peak)

Partial overlap handling

Booking conflict detection

Success screen with:

Room summary

Customer info

Total price

Countdown redirect + manual redirect

Toast notifications for success/error.

🛠️ Admin

View all bookings with:

User, room name, timings, status, price

Status colors (Confirmed/Cancelled)

Cancel bookings

❗Only allowed if start time is ≥ 2 hours away

Analytics dashboard:

Date range filter

Room-wise:

Total hours booked

Total revenue

Admin-specific toast notifications

Home navigation button

💰 Pricing Logic

Dynamic pricing uses:

Standard hourly rate

Peak hours:

10 AM → 1 PM

4 PM → 7 PM

Partial peak-hour overlaps charged proportionally

Mixed slot calculation (peak + non-peak)

Backend recalculates price to prevent manipulation

⏱ Booking Rules

End time must be after start time

Maximum booking duration: 12 hours

No overlapping with confirmed bookings

Cancellation allowed only if:

startTime - now ≥ 2 hours

🧱 Tech Stack
Frontend

React + Vite

Axios

React Router

Custom CSS

Toast notifications

Hosted on Vercel

Backend

Node.js + Express

UUID for booking IDs

Utilities: pricing.js, time.js

In-memory data (rooms.js, bookings.js)

Hosted on Render

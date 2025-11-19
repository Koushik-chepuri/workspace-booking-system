🚀 Workspace Booking System

A complete workspace room booking platform with real-time conflict detection, dynamic pricing, admin analytics, and a polished UI — built as part of a software engineering assignment.

Live Demo:

Frontend (Vercel): https://workspace-booking-system-coral.vercel.app

Backend (Render): https://workspace-booking-system-743i.onrender.com/api

✨ Features
👤 User Features

Browse available workspaces with rate, capacity, and features.

Book rooms with:

Start & end time selection

Dynamic pricing (peak + non-peak)

Pro-rated charges for partial overlaps

Automatic conflict detection

Success page with:

Room summary

Customer details

Price breakdown

Redirect countdown + manual "Go Home"

Toast notifications for all success/error states.

🛠️ Admin Features

View all bookings:

User, room name, timings, status, price

Status highlighting (Confirmed / Cancelled)

Cancel booking option (restricted)

Booking cancellation rule:
✔ Cannot cancel if less than 2 hours remain

Analytics dashboard:

Date range picker

Room-wise total hours booked

Room-wise revenue generated

Clean, structured tables

Admin-only toast notifications

“Home” button to return to landing page

💵 Dynamic Pricing

Pricing rules are based on:

Standard hourly rate (baseRate)

Peak hours:

10 AM – 1 PM

4 PM – 7 PM

Partial-hour overlaps are charged proportionally

Custom utility handles:

Full peak periods

Partial peak

Mixed segments

Correct UTC-based calculation

Backend always recalculates pricing to ensure integrity.

⏱ Booking Rules

End time must be strictly after start time.

Maximum booking duration: 12 hours

Room cannot overlap with any existing confirmed booking

Cancellation:

Allowed only if startTime − now ≥ 2 hours

🧱 Tech Stack
Frontend

React (with Vite)

Axios

React Router

Custom CSS

Toast notifications

Deployed on Vercel

Backend

Node.js + Express

UUID for booking IDs

Custom logic utilities (pricing.js, time.js)

In-memory database (rooms.js, bookings.js)

Deployed on Render

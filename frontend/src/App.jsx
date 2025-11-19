import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomsPage from "./pages/RoomsPage";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import SuccessCard from "./components/SuccessCard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomsPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/booking-success" element={<SuccessCard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

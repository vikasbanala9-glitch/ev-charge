import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Stations from "./pages/Stations.jsx";
import StationDetail from "./pages/StationDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ children, admin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Stations />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookings" element={<Protected><MyBookings /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/Sign-in";
import Signup from "./pages/Sign-up";
import Dashboard from "./pages/Dashboard";
import CreateClassroom from "./pages/CreateClassroom";
import JoinClassroom from "./pages/JoinClassroom";
import Classroom from "./pages/Classroom";
import InviteJoin from "./pages/InviteJoin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/signin" />} />

        {/* Auth Routes */}
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Create Classroom */}
        <Route path="/create" element={<ProtectedRoute><CreateClassroom /></ProtectedRoute>} />

        {/* Join Classroom (manual code entry) */}
        <Route path="/join" element={<ProtectedRoute><JoinClassroom /></ProtectedRoute>} />

        {/* 🆕 Invite Link Auto-Join */}
        <Route path="/invite/:classCode" element={<ProtectedRoute><InviteJoin /></ProtectedRoute>} />

        {/* Individual Classroom */}
        <Route path="/classroom/:classCode" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />

        {/* 🆕 Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/signin" />} />
      </Routes>
    </BrowserRouter>
  );
}
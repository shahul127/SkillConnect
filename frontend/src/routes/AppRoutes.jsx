import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Payments from "../Payments";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/payments" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payments" element={<Payments />} />
    </Routes>
  );
}

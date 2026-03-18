import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Predict from "./pages/Predict";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

// Component bảo vệ route (chưa đăng nhập thì đẩy về /login)
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/predict"} />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/predict" element={
          <ProtectedRoute allowedRole="user"><Predict /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute allowedRole="user"><History /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><Admin /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
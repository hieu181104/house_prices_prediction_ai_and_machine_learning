import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // Ẩn navbar ở trang login/register cho đẹp
  if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={navStyle}>
      <div style={{ fontSize: "22px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
        🏠 <span>AI House Predictor</span>
      </div>

      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        {user?.role === "user" && (
          <>
            <Link to="/predict" style={linkStyle}>Dự đoán giá</Link>
            <Link to="/history" style={linkStyle}>Lịch sử của tôi</Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link to="/admin" style={linkStyle}>Bảng điều khiển (Admin)</Link>
        )}

        <button onClick={logout} style={btnStyle}>Đăng xuất</button>
      </div>
    </div>
  );
}

export default Navbar;

const navStyle = {
  position: "fixed", top: 0, left: 0, right: 0,
  background: "rgba(25, 118, 210, 0.9)",
  backdropFilter: "blur(10px)",
  color: "white", padding: "15px 50px",
  display: "flex", justifyContent: "space-between", alignItems: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 1000
};

const linkStyle = { color: "white", textDecoration: "none", fontWeight: "500", fontSize: "16px" };

const btnStyle = {
  background: "#e53935", border: "none", padding: "8px 20px", color: "white",
  borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.3s"
};
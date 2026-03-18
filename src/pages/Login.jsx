import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/bg.jpg";
import { containerStyle, cardStyle, inputStyle, buttonStyle, errorStyle} from "../services/styles";

// HÀM COMPONENT CHÍNH //
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/predict");
      }
      
      // Load lại trang để Navbar nhận diện role mới
      window.location.reload();
    } catch (error) {
      console.error(error);
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div style={containerStyle(bg)}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: "20px" }}>
          👋 Chào mừng trở lại
        </h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input 
            placeholder="Tên đăng nhập" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            style={inputStyle} 
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyle} 
          />
          <button type="submit" style={buttonStyle}>Đăng nhập ngay</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ color: "#1976d2", fontWeight: "bold", textDecoration: "none" }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
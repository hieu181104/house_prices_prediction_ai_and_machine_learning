import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/bg.jpg";
import { containerStyle, cardStyle, inputStyle, buttonStyle} from "../services/styles";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", form);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError("Tên đăng nhập đã tồn tại!");
    }
  };

  return (
    <div style={containerStyle(bg)}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: "20px" }}>📝 Đăng ký tài khoản</h2>
        {error && <div style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: "15px" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input name="username" placeholder="Tên đăng nhập" onChange={e => setForm({ ...form, username: e.target.value })} required style={inputStyle} />
          <input type="password" name="password" placeholder="Mật khẩu" onChange={e => setForm({ ...form, password: e.target.value })} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Đăng ký ngay</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Đã có tài khoản? <Link to="/login" style={{ color: "#1976d2", fontWeight: "bold" }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
import { useState } from "react";
import API from "../services/api";
import bg from "../assets/bg.jpg";

const locations = [
  "Blmngtn", "Blueste", "BrDale", "BrkSide", "ClearCr", "CollgCr", "Crawfor", "Edwards", 
  "Gilbert", "IDOTRR", "MeadowV", "Mitchel", "NAmes", "NoRidge", "NPkVill", "NridgHt", 
  "NWAmes", "OldTown", "SWISU", "Sawyer", "SawyerW", "Somerst", "StoneBr", "Timber", "Veenker"
];

function Predict() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const [form, setForm] = useState({
    Neighborhood: "...", LotArea: 0, OverallQual: 0, OverallCond: 0,
    YearBuilt: 0, TotalBsmtSF: 0, GrLivArea: 0, FullBath: 0, BedroomAbvGr: 0
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        user_id: user.user_id,
        Neighborhood: form.Neighborhood,
        LotArea: Number(form.LotArea),
        OverallQual: Number(form.OverallQual),
        OverallCond: Number(form.OverallCond),
        YearBuilt: Number(form.YearBuilt),
        TotalBsmtSF: Number(form.TotalBsmtSF),
        GrLivArea: Number(form.GrLivArea),
        FullBath: Number(form.FullBath),
        BedroomAbvGr: Number(form.BedroomAbvGr)
      };

      const res = await API.post("/predict", payload);
      setPrice(res.data.predicted_price);
      setMetrics(res.data.metrics);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi dự đoán! Vui lòng kiểm tra lại dữ liệu.");
    }
    setLoading(false);
  };

  return (
    <div style={pageStyle(bg)}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", color: "#1976d2" }}>🤖 Hệ thống Dự đoán Giá nhà</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>Nhập thông số ngôi nhà để AI phân tích định giá</p>

        <form onSubmit={predict} style={gridStyle}>
          <div>
            <label>Khu vực (Neighborhood)</label>
            <select name="Neighborhood" value={form.Neighborhood} onChange={handleChange} style={inputStyle}>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div><label>Diện tích đất (sqft)</label><input type="number" name="LotArea" value={form.LotArea} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Chất lượng chung (1-10)</label><input type="number" min="1" max="10" name="OverallQual" value={form.OverallQual} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Độ mới/Tình trạng (1-10)</label><input type="number" min="1" max="10" name="OverallCond" value={form.OverallCond} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Năm xây dựng</label><input type="number" name="YearBuilt" value={form.YearBuilt} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Diện tích tầng hầm (sqft)</label><input type="number" name="TotalBsmtSF" value={form.TotalBsmtSF} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Diện tích sống (sqft)</label><input type="number" name="GrLivArea" value={form.GrLivArea} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Số phòng tắm</label><input type="number" name="FullBath" value={form.FullBath} onChange={handleChange} required style={inputStyle}/></div>
          <div><label>Số phòng ngủ</label><input type="number" name="BedroomAbvGr" value={form.BedroomAbvGr} onChange={handleChange} required style={inputStyle}/></div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Đang phân tích..." : "🚀 Bắt đầu dự đoán"}
          </button>
        </form>

        {price && (
          <div style={resultStyle}>
            <h3>
              💰 Giá trị ước tính:{" "}
              <span style={{ color: "#2e7d32", fontSize: "28px" }}>
                {Number(price).toLocaleString()} $
              </span>
            </h3>
            {metrics && (
              <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
                <p><b>Model Accuracy (R²):</b> {metrics.r2}</p>
                <p><b>Average Error (MAE):</b> ${Number(metrics.mae).toLocaleString()}</p>
                <p><b>RMSE:</b> ${Number(metrics.rmse).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Predict;

const pageStyle = (bg) => ({
  minHeight: "100vh",width: "100%", backgroundImage: `url(${bg})`, backgroundSize: "cover",
  backgroundAttachment: "fixed", display: "flex",flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "80px", paddingBottom: "40px"
});

const cardStyle = { width: "700px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px", boxSizing: "border-box" };
const btnStyle = { gridColumn: "1 / -1", padding: "15px", background: "#1976d2", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const resultStyle = { marginTop: "25px", padding: "20px", background: "#e8f5e9", borderRadius: "10px", textAlign: "center", border: "2px dashed #4caf50" };
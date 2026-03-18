import { useEffect, useState } from "react";
import API from "../services/api";
import bg from "../assets/bg.jpg";

function History() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get(`/my-predictions/${user.user_id}`);
      setData(res.data);
    };
    fetchData();
  }, [user.user_id]);

  return (
    <div style={pageStyle(bg)}>
      <div style={cardStyle}>
        <h2 style={{ color: "#1976d2", marginBottom: "20px" }}>🕒 Lịch sử dự đoán của bạn</h2>
        {data.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Bạn chưa có dự đoán nào.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Mã ID</th>
                  <th>Khu vực</th>
                  <th>Diện tích</th>
                  <th>Chất lượng</th>
                  <th>Tình trạng</th>
                  <th>Năm xây dựng</th>
                  <th>Diện tích hầm</th>
                  <th>Diện tích ở</th>
                  <th>Số phòng tắm</th>
                  <th>Số phòng ngủ</th>
                  <th>Giá dự đoán ($)</th>
                  <th>Thời gian dự đoán</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>#{item.id}</td>
                    <td>{item.Location}</td>
                    <td>{item.LotArea}</td>
                    <td>{item.OverallQual}</td>
                    <td>{item.OverallCond}</td>
                    <td>{item.YearBuilt}</td>                    
                    <td>{item.TotalBsmtSF}</td>
                    <td>{item.GrLivArea}</td>                
                    <td>{item.FullBath}</td>
                    <td>{item.BedroomAbvGr}</td>
                    <td style={{ fontWeight: "bold", color: "#2e7d32" }}>{Number(item.predicted_price).toLocaleString()}</td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;

const pageStyle = (bg) => ({ minHeight: "100vh", width: "100%", backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundAttachment: "fixed", paddingTop: "100px", paddingBottom: "50px", display: "flex", justifyContent: "center" });
const cardStyle = { width: "900px", maxWidth: "1000px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
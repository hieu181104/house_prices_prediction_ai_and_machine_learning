import { useEffect, useState} from "react";
import API from "../services/api";
import bg from "../assets/bg.jpg";

function Admin() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_predictions: 0, average_price: 0 });
  
  // Thêm biến này để làm "công tắc" kích hoạt load lại dữ liệu
  const [refreshKey, setRefreshKey] = useState(0); 

  // Đưa toàn bộ logic vào thẳng useEffect
  useEffect(() => {
    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.user_id;

      if (!userId) return;

      try {
        const [resData, resStats] = await Promise.all([
          API.get(`/admin/predictions/${userId}`),
          API.get(`/admin/stats/${userId}`)
        ]);
        
        // Cập nhật state sau khi đã await
        setData(resData.data);
        setStats(resStats.data);
      } catch (error) {
        console.error("Lỗi fetch data:", error);
      }
    };

    fetchData();
  }, [refreshKey]); // useEffect sẽ tự chạy lại mỗi khi refreshKey thay đổi

  // Hàm xóa dữ liệu
  const deleteRow = async (id) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if(window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      try {
        await API.delete(`/admin/predictions/${id}/${storedUser.user_id}`);
        setRefreshKey(prev => prev + 1); 
      } catch (error) {
        console.error(error);
        alert("Không thể xóa dữ liệu!");
      }
    }
  };

  return (
    <div style={pageStyle(bg)}>
      <div style={{ width: "1000px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Thẻ Thống Kê */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={statCard}>
            <h3 style={{fontSize: "16px", color: "#666"}}>Tổng số lượt dự đoán</h3>
            <div style={statNumber}>{stats.total_predictions}</div>
          </div>
          <div style={statCard}>
            <h3 style={{fontSize: "16px", color: "#666"}}>Giá dự đoán trung bình</h3>
            <div style={statNumber}>{Number(stats.average_price).toLocaleString()} $</div>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div style={cardStyle}>
          <h2 style={{ color: "#1976d2", marginBottom: "20px" }}> Toàn bộ lịch sử dự đoán </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{borderBottom: "2px solid #eee"}}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>User ID</th>
                  <th style={thStyle}>Khu vực</th>
                  <th style={thStyle}>Diện tích</th>
                  <th style={thStyle}>Chất lượng</th>
                  <th style={thStyle}>Tình trạng</th>
                  <th style={thStyle}>Năm xây dựng</th>
                  <th style={thStyle}>Diện tích hầm</th>
                  <th style={thStyle}>Diện tích ở</th>
                  <th style={thStyle}>Số phòng tắm</th>
                  <th style={thStyle}>Số phòng ngủ</th>
                  <th style={thStyle}>Giá dự đoán</th>
                  <th style={thStyle}>Thời gian</th>
                  <th style={thStyle}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>#{row.id}</td>
                    <td style={tdStyle}>👤 {row.user_id}</td>
                    <td style={tdStyle}>{row.Location}</td>
                    <td style={tdStyle}>{row.LotArea} ft²</td>
                    <td style={tdStyle}>{row.OverallQual}/10</td>
                    <td style={tdStyle}>{row.OverallCond}/10</td>
                    <td style={tdStyle}>{row.YearBuilt}</td>
                    <td style={tdStyle}>{row.TotalBsmtSF}</td>
                    <td style={tdStyle}>{row.GrLivArea}</td>
                    <td style={tdStyle}>{row.FullBath}</td>
                    <td style={tdStyle}>{row.BedroomAbvGr}</td>
                    <td style={{ ...tdStyle, color: "#2e7d32", fontWeight: "bold" }}>
                      {Number(row.predicted_price).toLocaleString()} $
                    </td>
                    <td style={tdStyle}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => deleteRow(row.id)} style={deleteBtn}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && <p style={{textAlign: "center", padding: "20px"}}>Chưa có dữ liệu nào.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;

// -------- STYLES -------- //

const pageStyle = (bg) => ({ 
  minHeight: "100vh",
  width: "100%",
  backgroundImage: `url(${bg})`, 
  backgroundSize: "cover", 
  backgroundAttachment: "fixed", 
  paddingTop: "100px", 
  paddingBottom: "50px", 
  display: "flex", 
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center"
});

const cardStyle = { 
  width: "100%",
  maxWidth: "1200px",
  background: "rgba(255,255,255,0.95)", 
  padding: "30px", 
  borderRadius: "16px", 
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)" 
};

const statCard = { 
  flex: 1, 
  background: "rgba(255,255,255,0.95)", 
  padding: "20px", 
  borderRadius: "16px", 
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)", 
  textAlign: "center", 
  borderLeft: "5px solid #1976d2" 
};

const statNumber = { 
  fontSize: "32px", 
  fontWeight: "bold", 
  color: "#1976d2", 
  marginTop: "10px" 
};

const tableStyle = { 
  width: "100%", 
  borderCollapse: "collapse", 
  marginTop: "10px",
  fontSize: "14px"
};

const thStyle = { padding: "12px", color: "#666", fontWeight: "600" };
const tdStyle = { padding: "12px" };

const deleteBtn = { 
  background: "#ffebee", 
  color: "#c62828", 
  border: "1px solid #ffcdd2", 
  padding: "6px 12px", 
  borderRadius: "6px", 
  cursor: "pointer", 
  fontWeight: "bold" 
};
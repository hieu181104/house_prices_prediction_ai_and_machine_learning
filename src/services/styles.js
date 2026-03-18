export const containerStyle = (bgImage) => ({
  minHeight: "100vh",
  width: "100vw",
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: 0,
  padding: 0
});

export const cardStyle = {
  width: "400px",
  maxWidth: "400px",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(15px)",
  padding: "40px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  margin: "20px"
};

export const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
  marginBottom: "10px",
  outline: "none"
};

export const buttonStyle = {
  padding: "14px",
  background: "linear-gradient(135deg, #1976d2, #1565c0)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

export const errorStyle = {
  background: "#ffebee",
  color: "#c62828",
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  marginBottom: "15px",
  fontSize: "14px"
};
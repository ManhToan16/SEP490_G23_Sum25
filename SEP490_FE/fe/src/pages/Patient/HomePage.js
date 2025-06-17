import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "960px",
    margin: "0 auto",
    backgroundColor: "#f5f8ff",
    color: "#333",
  },
  header: {
    backgroundColor: "#004080",
    color: "white",
    padding: "40px 20px",
    borderRadius: "8px",
    textAlign: "center",
    position: "relative",
  },
  headerTitle: {
    margin: 0,
    fontSize: "32px",
  },
  headerSub: {
    marginTop: "10px",
    fontSize: "18px",
  },
  loginButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#ffffff",
    color: "#004080",
    border: "none",
    padding: "10px 16px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "background-color 0.3s",
  },
  loginButtonHover: {
    backgroundColor: "#e6e6e6",
  },
  section: {
    backgroundColor: "white",
    margin: "20px 0",
    padding: "20px",
    borderLeft: "6px solid #004080",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    marginTop: 0,
    color: "#004080",
  },
  list: {
    paddingLeft: "20px",
    lineHeight: "1.8",
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    marginTop: "40px",
  },
};

const PatientDashboard = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          style={styles.loginButton}
          onClick={handleLogin}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#e6e6e6")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
        >
          Đăng nhập
        </button>
        <h1 style={styles.headerTitle}>Phòng Khám Nội Thần Kinh Khánh An</h1>
        <p style={styles.headerSub}>
          Chăm sóc sức khỏe hệ thần kinh của bạn một cách toàn diện
        </p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Dịch vụ nổi bật</h2>
        <ul style={styles.list}>
          <li>🔬 Khám và điều trị các bệnh lý thần kinh</li>
          <li>📅 Đặt lịch khám trực tuyến</li>
          <li>🧠 Tư vấn và theo dõi bệnh nhân từ xa</li>
          <li>📄 Quản lý hồ sơ bệnh án điện tử</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Đội ngũ bác sĩ</h2>
        <p>
          Gồm các bác sĩ chuyên khoa thần kinh giàu kinh nghiệm, tốt nghiệp trong và ngoài nước,
          luôn tận tâm với bệnh nhân.
        </p>
      </section>

      <footer style={styles.footer}>
        <p>&copy; 2025 Phòng Khám Nội Thần Kinh Khánh An. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default PatientDashboard;
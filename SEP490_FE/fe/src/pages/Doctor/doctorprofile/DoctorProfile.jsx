import React, { useState } from "react";
import "./DoctorProfile.scss";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState({
    name: "Dr. Nguyễn Văn A",
    email: "dr.nguyen@example.com",
    phone: "0901234567",
    specialization: "Thần kinh",
    description: "Bác sĩ chuyên khoa thần kinh với 10 năm kinh nghiệm.",
    gender: "Nam",
    dob: "1985-06-15",
    avatar: "https://via.placeholder.com/120"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctor((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("✅ Hồ sơ đã được cập nhật!");
  };

  return (
    <div className="doctor-profile-container">
      <h2>👨‍⚕️ Hồ sơ của tôi</h2>
      <div className="profile-card">
        <div className="avatar-section">
          <img src={doctor.avatar} alt="Avatar" className="avatar" />
          {isEditing && (
            <label className="upload-label">
              📷 Chọn ảnh
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          )}
        </div>

        <div className="form-section">
          <div className="form-row">
            <label>Họ tên:</label>
            <input
              name="name"
              value={doctor.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Email:</label>
            <input
              name="email"
              value={doctor.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Số điện thoại:</label>
            <input
              name="phone"
              value={doctor.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Giới tính:</label>
            <select
              name="gender"
              value={doctor.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-row">
            <label>Ngày sinh:</label>
            <input
              type="date"
              name="dob"
              value={doctor.dob}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Chuyên khoa:</label>
            <input
              name="specialization"
              value={doctor.specialization}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={doctor.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="button-row">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave}>💾 Lưu</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>❌ Hủy</button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>✏️ Cập nhật thông tin</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;

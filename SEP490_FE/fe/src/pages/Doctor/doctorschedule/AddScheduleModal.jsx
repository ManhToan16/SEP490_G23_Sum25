import React, { useState } from "react";
import "./AddScheduleModal.scss";

const AddScheduleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    status: "Có mặt",
    room: "Phòng 1",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    const { date, startTime, endTime } = formData;
    if (!date || !startTime || !endTime) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (startTime >= endTime) {
      setError("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }

    setError("");
    onSubmit(formData);
    onClose();
    setFormData({ date: "", startTime: "", endTime: "", status: "Có mặt", room: "Phòng 1" });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Thêm lịch làm việc</h3>

        <label>Ngày:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />

        <label>Giờ bắt đầu:</label>
        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />

        <label>Giờ kết thúc:</label>
        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />

        <label>Phòng:</label>
        <select name="room" value={formData.room} onChange={handleChange}>
          <option>Phòng 1</option>
          <option>Phòng 2</option>
          <option>Phòng 3</option>
        </select>

        <label>Trạng thái:</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>Có mặt</option>
          <option>Bận</option>
          <option>Nghỉ</option>
        </select>

        {error && <div className="error">{error}</div>}

        <div className="modal-actions">
          <button onClick={handleSubmit}>Lưu</button>
          <button className="cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;

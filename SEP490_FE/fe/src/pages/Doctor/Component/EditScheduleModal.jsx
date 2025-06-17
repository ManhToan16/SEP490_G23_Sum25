import React, { useState, useEffect } from "react";
import "./EditScheduleModal.scss";

const EditScheduleModal = ({ isOpen, onClose, data, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState(data || {});
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

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
    onUpdate(formData);
    onClose();
  };

  const handleDelete = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xoá lịch làm việc này?");
    if (confirm) {
      onDelete(formData.id);
      onClose();
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Sửa lịch làm việc</h3>

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
          <button className="btn btn-save" onClick={handleSubmit}>Cập nhật</button>
          <button className="btn btn-delete" onClick={handleDelete}>Xoá</button>
          <button className="btn btn-cancel" onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;

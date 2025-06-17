// File: AppointmentDetailModal.jsx
import React, { useState } from "react";
import "./AppointmentDetailModal.scss";

const AppointmentDetailModal = ({ appointment, onClose }) => {
  const [status, setStatus] = useState(appointment.status);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    // TODO: Call API or update logic here
  };

  return (
    <div className="appointment-modal-overlay">
      <div className="appointment-modal">
        <div className="modal-header">
          <h3>🧑‍⚕️ Thông tin chi tiết lịch hẹn</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-content">
          <div className="info-row">
            <label>👤 Bệnh nhân:</label>
            <span>{appointment.patientName}</span>
          </div>
          <div className="info-row">
            <label>🕘 Thời gian:</label>
            <span>{appointment.time}</span>
          </div>
          <div className="info-row">
            <label>🏥 Phòng:</label>
            <span>{appointment.room}</span>
          </div>

          <div className="info-row">
            <label>📄 Trạng thái:</label>
            <select value={status} onChange={handleStatusChange}>
              <option value="Chờ khám">Chờ khám</option>
              <option value="Đang khám">Đang khám</option>
              <option value="Đã khám">Đã khám</option>
            </select>
          </div>

          {appointment.medicalRecord && (
            <div className="record-section">
              <h4>📘 Hồ sơ bệnh án trước đó</h4>
              <div className="info-row">
                <label>🩺 Chẩn đoán:</label>
                <span>{appointment.medicalRecord.diagnosis}</span>
              </div>
              <div className="info-row">
                <label>💊 Điều trị:</label>
                <span>{appointment.medicalRecord.treatment}</span>
              </div>
              <div className="info-row">
                <label>📋 Đơn thuốc:</label>
                <span>{appointment.medicalRecord.prescription}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
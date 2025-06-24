import React, { useState } from "react";
import "./CreateServiceModal.scss";

const SERVICE_OPTIONS = [
  "Phòng điện não (EEG)",
  "Phòng điện tim (ECG)",
  "Phòng điện cơ (EMG)",
  "Phòng siêu âm Doppler",
  "Phòng siêu âm tổng quát",
  "Phòng test tâm lý",
  "Phòng lấy mẫu xét nghiệm"
];

const CreateServiceModal = ({ patient, onClose, onSubmit }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) return;
    onSubmit(selectedServices);
    onClose();
  };

  return (
    <div className="create-service-modal-overlay">
      <div className="create-service-modal">
        <h3>Chọn dịch vụ cho {patient?.patientName}</h3>
        <div className="services-list">
          {SERVICE_OPTIONS.map((service) => (
            <label key={service} className="service-item">
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={selectedServices.length === 0}
          >
            Tạo hàng đợi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;

import React, { useState, useEffect } from "react";
import "./MedicalRecordModal.scss";

const MedicalRecordModal = ({ appointment, onClose, onSave }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [examinationForms, setExaminationForms] = useState([]); // For uploaded forms

  useEffect(() => {
    if (appointment?.medicalRecord) {
      setDiagnosis(appointment.medicalRecord.diagnosis || "");
      setTreatment(appointment.medicalRecord.treatment || "");
      setPrescription(appointment.medicalRecord.prescription || "");
      setExaminationForms(appointment.medicalRecord.examinationForms || []);
    }
  }, [appointment]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newForms = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setExaminationForms((prev) => [...prev, ...newForms]);
  };

  const handleSubmit = () => {
    const record = {
      diagnosis,
      treatment,
      prescription,
      examinationForms,
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="medical-record-modal-overlay">
      <div className="medical-record-modal">
        <h3>Hồ sơ bệnh án - {appointment?.patientName}</h3>
        <div className="form-group">
          <label>Chẩn đoán</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Nhập chẩn đoán bệnh..."
          />
        </div>
        <div className="form-group">
          <label>Phác đồ điều trị</label>
          <textarea
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Nhập phác đồ điều trị..."
          />
        </div>
        <div className="form-group">
          <label>Đơn thuốc</label>
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            placeholder="Nhập đơn thuốc..."
          />
        </div>
        <div className="form-group">
          <label>Phiếu khám / Xét nghiệm</label>
          <input type="file" multiple onChange={handleFileUpload} />
          <ul className="form-list">
            {examinationForms.map((form, idx) => (
              <li key={idx}><a href={form.url} target="_blank" rel="noreferrer">{form.name}</a></li>
            ))}
          </ul>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>Lưu hồ sơ</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;
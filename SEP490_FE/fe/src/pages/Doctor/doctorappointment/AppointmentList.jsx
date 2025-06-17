import React, { useState } from "react";
import AppointmentDetailModal from "./AppointmentDetailModal";
import CreateServiceModal from "./CreateServiceModal";
import MedicalRecordModal from "./MedicalRecordModal";
import "./AppointmentList.scss";

const AppointmentList = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [servicePatient, setServicePatient] = useState(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [recordPatient, setRecordPatient] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: today,
      time: "08:00",
      patientName: "Nguyễn Văn A",
      room: "Phòng khám chính",
      services: ["Điện tim"],
      status: "Chờ khám",
      medicalRecord: null,
    },
    {
      id: 2,
      date: today,
      time: "08:30",
      patientName: "Trần Thị B",
      room: "Phòng khám chính",
      services: ["Xét nghiệm máu"],
      status: "Đang khám",
      medicalRecord: null,
    },
    {
      id: 3,
      date: today,
      time: "09:00",
      patientName: "Lê Văn C",
      room: "Phòng khám chính",
      services: [],
      status: "Đã khám",
      medicalRecord: {
        diagnosis: "Viêm họng cấp",
        treatment: "Uống kháng sinh 5 ngày",
        prescription: "Amoxicillin 500mg x 2 lần/ngày",
        examinationForms: [],
      },
    },
  ]);

  const todayAppointments = appointments.filter((appt) => appt.date === today);

  const handleViewDetail = (appt) => {
    setSelectedAppointment(appt);
  };

  const handleCreateService = (appt) => {
    setServicePatient(appt);
    setShowServiceModal(true);
  };

  const handleCreateOrUpdateRecord = (appt) => {
    setRecordPatient(appt);
    setRecordModalVisible(true);
  };

  const handleServiceSubmit = (services) => {
    console.log("Dịch vụ được chọn:", services);
    setShowServiceModal(false);
  };

  const handleSaveMedicalRecord = (record) => {
    const updatedAppointments = appointments.map((appt) =>
      appt.id === recordPatient.id
        ? { ...appt, medicalRecord: record }
        : appt
    );
    setAppointments(updatedAppointments);
    setRecordModalVisible(false);
  };

  return (
    <div className="appointment-list-container">
      <h2>📅 Lịch hẹn hôm nay</h2>
      <div className="appointment-list">
        {todayAppointments.map((appt, index) => (
          <div
            key={appt.id}
            className={`appointment-item ${appt.status.toLowerCase().replace(/\s/g, "-")}`}
          >
            <div className="index">{index + 1}</div>
            <div className="time">{appt.time}</div>
            <div className="name">{appt.patientName}</div>
            <div className="room">{appt.room}</div>
            <div className="status">{appt.status}</div>

            <div className="actions">
              <button className="btn-action" onClick={() => handleViewDetail(appt)}>
                Xem chi tiết
              </button>
              <button className="btn-action" onClick={() => handleCreateService(appt)}>
                Tạo dịch vụ
              </button>
              <button className="btn-action" onClick={() => handleCreateOrUpdateRecord(appt)}>
                Hồ sơ
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {showServiceModal && (
        <CreateServiceModal
          patient={servicePatient}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleServiceSubmit}
        />
      )}

      {recordModalVisible && (
        <MedicalRecordModal
          appointment={recordPatient}
          onClose={() => setRecordModalVisible(false)}
          onSave={handleSaveMedicalRecord}
        />
      )}
    </div>
  );
};

export default AppointmentList;

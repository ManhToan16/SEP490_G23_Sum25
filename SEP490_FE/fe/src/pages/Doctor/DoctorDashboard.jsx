import React, { useState } from "react";
import DoctorProfile from "./DoctorProfile";
import DoctorScheduleView from "./DoctorScheduleView";
import AppointmentList from "./AppointmentList";
import MedicalRecordCabinet from "./MedicalRecordCabinet";
import "./DoctorDashboard.scss";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="doctor-dashboard">
      <div className="tab-bar">
        <button
          className={activeTab === "schedule" ? "active" : ""}
          onClick={() => setActiveTab("schedule")}
        >
          📅 Xem lịch làm việc
        </button>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          👨‍⚕️ Hồ sơ của tôi
        </button>
        <button
          className={activeTab === "appointments" ? "active" : ""}
          onClick={() => setActiveTab("appointments")}
        >
          📋 Lịch hẹn của bệnh nhân
        </button>
        <button
          className={activeTab === "cabinet" ? "active" : ""}
           onClick={() => setActiveTab("cabinet")}
        >
           🗃️ Tủ hồ sơ bệnh án
          </button>
      </div>

      <div className="tab-content">
        {activeTab === "schedule" && <DoctorScheduleView />}
        {activeTab === "profile" && <DoctorProfile />}
        {activeTab === "appointments" && <AppointmentList />} {/* 🆕 */}
        {activeTab === "cabinet" && <MedicalRecordCabinet />}
      </div>
    </div>
  );
};

export default DoctorDashboard;

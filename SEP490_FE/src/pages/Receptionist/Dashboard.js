import React, { useState } from "react";
import { motion } from "framer-motion";

// Giả lập danh sách có chứa ngày
const allAppointments = [
    { date: "2025-06-16", time: "08:00", name: "Nguyen Van A", doctor: "Dr. Linh", status: "Scheduled" },
    { date: "2025-06-16", time: "08:30", name: "Tran Thi B", doctor: "Dr. Minh", status: "Confirmed" },
    { date: "2025-06-17", time: "09:00", name: "Le Van C", doctor: "Dr. Hoa", status: "Pending" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi D", doctor: "Dr. Quang", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi E", doctor: "Dr. Minh", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi F", doctor: "Dr. Linh", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi G", doctor: "Dr. Quang", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi H", doctor: "Dr. Quang", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi I", doctor: "Dr. Quang", status: "Scheduled" },
    { date: "2025-06-17", time: "10:00", name: "Pham Thi J", doctor: "Dr. Quang", status: "Scheduled" },
];

export default function ViewAppointmentCalendar() {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [newPatient, setNewPatient] = useState({ name: "", time: "", doctor: "" });

    const handleAddPatient = () => {
        if (newPatient.name && newPatient.time && newPatient.doctor) {
            allAppointments.push({ ...newPatient, status: "Manual" });
            setNewPatient({ name: "", time: "", doctor: "" });
            setShowPopup(false);
        }
    };

    const filteredAppointments = allAppointments.filter(appt => appt.date === selectedDate);

    return (
        <div className="container">
            <motion.div
                className="calendar-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="card">
                    <h2>Lịch hẹn</h2>
                    <input
                        type="date"
                        className="calendar-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </motion.div>

            <motion.div
                className="appointment-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="card">
                    <h2>Danh sách cuộc hẹn ngày {selectedDate}</h2>
                    <button className="add-button" onClick={() => setShowPopup(true)}>
                        + Thêm bệnh nhân thủ công
                    </button>
                    <div className="appointment-list">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appt, index) => (
                                <div key={index} className="appointment-item">
                                    <div className="appointment-info">
                                        <p className="appointment-name">{appt.time} - {appt.name}</p>
                                        <p className="appointment-doctor">{appt.doctor}</p>
                                    </div>
                                    <button className="status-button">{appt.status}</button>
                                    <button className="status-button">Gán bác sĩ</button>

                                </div>
                            ))
                        ) : (
                            <p>Không có lịch hẹn.</p>
                        )}
                    </div>
                </div>
            </motion.div>
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Thêm bệnh nhân mới</h3>
                        <input
                            type="text"
                            placeholder="Tên bệnh nhân"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                        />
                        <input
                            type="time"
                            value={newPatient.time}
                            onChange={(e) => setNewPatient({ ...newPatient, time: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Tên bác sĩ"
                            value={newPatient.doctor}
                            onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
                        />
                        <div className="popup-buttons">
                            <button onClick={handleAddPatient}>Thêm</button>
                            <button onClick={() => setShowPopup(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          padding: 20px;
        }

        .card {
          background: #fff;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .calendar-input {
          width: 90%;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .add-button {
          background-color: #007bff;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .appointment-list {
          max-height: 400px;
          overflow-y: auto;
          margin-top: 20px;
        }

        .appointment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 10px;
          margin-bottom: 10px;
          transition: background 0.3s;
        }

        .appointment-item:hover {
          background: #f9f9f9;
        }

        .appointment-name {
          font-weight: 500;
        }

        .appointment-doctor {
          font-size: 14px;
          color: #777;
        }

        .status-button {
          background: transparent;
          border: 1px solid #ccc;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .popup {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          width: 300px;
        }

        .popup input {
          width: 100%;
          margin: 8px 0;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .popup-buttons {
          display: flex;
          justify-content: space-between;
        }

        .popup-buttons button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}

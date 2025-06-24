import React, { useState } from "react";
import "./DoctorScheduleView.scss";
import AddScheduleModal from "./Component/AddScheduleModal";
import EditScheduleModal from "./Component/EditScheduleModal";

const DoctorScheduleView = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleAddSchedule = (formData) => {
    const newSchedule = { ...formData, id: Date.now() };
    setSchedule([...schedule, newSchedule]);
  };

  const handleUpdateSchedule = (updatedItem) => {
    const updatedList = schedule.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setSchedule(updatedList);
  };

  const handleDeleteSchedule = (id) => {
    const updatedList = schedule.filter((item) => item.id !== id);
    setSchedule(updatedList);
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  );

  const daysOfWeek = [
    { label: "Thứ 2 09/06", value: "2025-06-09" },
    { label: "Thứ 3 10/06", value: "2025-06-10" },
    { label: "Thứ 4 11/06", value: "2025-06-11" },
    { label: "Thứ 5 12/06", value: "2025-06-12" },
    { label: "Thứ 6 13/06", value: "2025-06-13" },
    { label: "Thứ 7 14/06", value: "2025-06-14" },
    { label: "CN 15/06", value: "2025-06-15" },
  ];

  const getCellStatus = (dayValue, hour) => {
    return schedule.find((item) => {
      const [startHour] = item.startTime.split(":");
      const [endHour] = item.endTime.split(":");
      return (
        item.date === dayValue &&
        parseInt(startHour) <= parseInt(hour) &&
        parseInt(endHour) > parseInt(hour)
      );
    });
  };

  const handleCellClick = (dayValue, hour) => {
    const existing = getCellStatus(dayValue, hour);
    if (existing) {
      setEditingSchedule(existing);
      setShowEditModal(true);
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-toolbar">
        <div className="status-tags">
          <span className="status available">Có mặt</span>
          <span className="status leave">Nghỉ</span>
          <span className="status busy">Bận</span>
        </div>

        <button
          onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
        >
          Hôm nay
        </button>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <select>
          <option>Xem theo tuần</option>
        </select>

        <button className="add-schedule-btn" onClick={() => setShowModal(true)}>
          + Thêm lịch
        </button>
      </div>

      <div className="schedule-table">
        <div className="schedule-header">
          <div className="time-cell"> </div>
          {daysOfWeek.map((day, i) => (
            <div className="day-cell" key={i}>
              {day.label}
            </div>
          ))}
        </div>

        <div className="schedule-body">
          {timeSlots.map((time, rowIndex) => (
            <div className="row" key={rowIndex}>
              <div className="time-cell">{time}</div>
              {daysOfWeek.map((day, colIndex) => {
                const hour = time.split(":")[0];
                const item = getCellStatus(day.value, hour);
                const statusClass = item ? item.status.toLowerCase() : "";

                return (
                  <div
                    className={`cell ${statusClass}`}
                    key={colIndex}
                    onClick={() => handleCellClick(day.value, hour)}
                  >
                    {item ? `${item.room} - ${item.status}` : ""}
                    {item && (
                      <div className="custom-tooltip">
                        <div><strong>Phòng:</strong> {item.room}</div>
                        <div><strong>Trạng thái:</strong> {item.status}</div>
                        <div><strong>Giờ:</strong> {item.startTime} - {item.endTime}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <AddScheduleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddSchedule}
      />

      <EditScheduleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={editingSchedule}
        onUpdate={handleUpdateSchedule}
        onDelete={handleDeleteSchedule}
      />
    </div>
  );
};

export default DoctorScheduleView;

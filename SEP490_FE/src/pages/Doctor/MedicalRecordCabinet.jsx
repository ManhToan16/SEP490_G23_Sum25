import React, { useState } from "react";
import "./MedicalRecordCabinet.scss";

const MedicalRecordCabinet = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [searchName, setSearchName] = useState("");

  const mockRecords = [
    {
      id: 1,
      patientName: "Nguyễn Văn A",
      birthDate: "1990-01-01",
      gender: "Nam",
      examDate: "2025-06-17",
      services: ["Điện não (EEG)", "Điện tim (ECG)"],
      diagnosis: "Rối loạn sóng não nhẹ",
      treatment: "Theo dõi và hẹn tái khám sau 1 tháng",
      images: ["/assets/phieu1.png", "/assets/phieu2.png"],
    },
    {
      id: 2,
      patientName: "Trần Thị B",
      birthDate: "1985-05-10",
      gender: "Nữ",
      examDate: "2025-06-16",
      services: ["Siêu âm Doppler", "Lấy mẫu xét nghiệm"],
      diagnosis: "Thiếu máu não nhẹ",
      treatment: "Bổ sung tuần hoàn máu não",
      images: [],
    },
    {
      id: 3,
      patientName: "Lê Văn C",
      birthDate: "1992-08-20",
      gender: "Nam",
      examDate: "2025-06-15",
      services: ["Test tâm lý"],
      diagnosis: "Căng thẳng tâm lý",
      treatment: "Tư vấn tâm lý và nghỉ ngơi",
      images: [],
    },
    {
      id: 4,
      patientName: "Lê Thị D",
      birthDate: "1994-03-05",
      gender: "Nữ",
      examDate: "2025-06-14",
      services: ["Siêu âm tổng quát"],
      diagnosis: "Không phát hiện bất thường",
      treatment: "Không cần điều trị",
      images: [],
    },
    {
      id: 5,
      patientName: "Ngô Văn E",
      birthDate: "1988-11-22",
      gender: "Nam",
      examDate: "2025-06-13",
      services: ["Điện cơ (EMG)", "Lấy mẫu xét nghiệm"],
      diagnosis: "Cơ yếu nhẹ",
      treatment: "Tập phục hồi chức năng",
      images: [],
    },
    {
      id: 6,
      patientName: "Đặng Thị F",
      birthDate: "1995-07-01",
      gender: "Nữ",
      examDate: "2025-06-12",
      services: ["Điện tim (ECG)"],
      diagnosis: "Nhịp tim không đều",
      treatment: "Theo dõi tim mạch",
      images: [],
    },
    {
      id: 7,
      patientName: "Bùi Văn G",
      birthDate: "1990-02-14",
      gender: "Nam",
      examDate: "2025-06-11",
      services: ["Điện cơ (EMG)", "Điện não (EEG)"],
      diagnosis: "Rối loạn dẫn truyền cơ thần kinh",
      treatment: "Kê đơn thuốc tăng cường thần kinh",
      images: [],
    },
    {
      id: 8,
      patientName: "Võ Thị H",
      birthDate: "1987-09-30",
      gender: "Nữ",
      examDate: "2025-06-10",
      services: ["Siêu âm Doppler", "Điện tim (ECG)"],
      diagnosis: "Tăng huyết áp nhẹ",
      treatment: "Dùng thuốc điều áp",
      images: [],
    },
    {
      id: 9,
      patientName: "Hoàng Văn I",
      birthDate: "1993-04-04",
      gender: "Nam",
      examDate: "2025-06-09",
      services: ["Lấy mẫu xét nghiệm"],
      diagnosis: "Mỡ máu cao",
      treatment: "Kiêng ăn dầu mỡ + thuốc hạ mỡ máu",
      images: [],
    },
    {
      id: 10,
      patientName: "Lý Thị K",
      birthDate: "1996-12-12",
      gender: "Nữ",
      examDate: "2025-06-08",
      services: ["Test tâm lý"],
      diagnosis: "Lo âu xã hội mức nhẹ",
      treatment: "Tham vấn tâm lý mỗi tuần",
      images: [],
    },
  ];

  const filteredRecords = mockRecords.filter((r) => {
    const matchDate = filterDate ? r.examDate === filterDate : true;
    const matchName = r.patientName.toLowerCase().includes(searchName.toLowerCase());
    return matchDate && matchName;
  });

  return (
    <div className="record-cabinet">
      <h2>🗃️ Tủ hồ sơ bệnh án</h2>

      <div className="filter-bar">
        <label>
          🔍 Tìm theo tên:
          <input
            type="text"
            placeholder="Nhập tên bệnh nhân..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </label>

        <label>
          📅 Ngày khám:
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </label>

        {(filterDate || searchName) && (
          <button onClick={() => { setFilterDate(""); setSearchName(""); }}>
            ❌ Xoá lọc
          </button>
        )}
      </div>

      {!selectedRecord ? (
        <div className="record-list">
          {filteredRecords.length === 0 ? (
            <p>⚠️ Không tìm thấy hồ sơ phù hợp.</p>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="record-item"
                onClick={() => setSelectedRecord(record)}
              >
                <h4>{record.patientName}</h4>
                <p>🗓️ Ngày khám: {record.examDate}</p>
                <p>🧪 Dịch vụ: {record.services.join(", ")}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="record-detail">
          <h3>🧾 Hồ sơ: {selectedRecord.patientName}</h3>
          <p>🗓️ Ngày khám: {selectedRecord.examDate}</p>
          <p>👤 Giới tính: {selectedRecord.gender}</p>
          <p>🧪 Dịch vụ đã sử dụng: {selectedRecord.services.join(", ")}</p>
          <p>📋 Chẩn đoán: {selectedRecord.diagnosis}</p>
          <p>💊 Điều trị: {selectedRecord.treatment}</p>

          <div className="record-images">
            <h4>📎 Ảnh phiếu khám, xét nghiệm:</h4>
            {selectedRecord.images.length > 0 ? (
              selectedRecord.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Hình ${idx + 1}`} />
              ))
            ) : (
              <p>Không có ảnh đính kèm.</p>
            )}
          </div>

          <button onClick={() => setSelectedRecord(null)}>
            ⬅️ Quay lại danh sách
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordCabinet;

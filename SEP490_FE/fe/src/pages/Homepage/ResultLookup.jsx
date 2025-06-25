import React, { useState } from 'react';
import './ResultLookup.scss';

const ResultLookup = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.toLowerCase() === 'kh001') {
      setSearchResult({
        patientName: 'Nguyễn Văn A',
        recordCode: 'KH001',
        examDate: '2024-01-15',
        doctor: 'BS. Nguyễn Văn An',
        diagnosis: 'Đau đầu mạn tính',
        examResults: [
          {
            type: 'Khám lâm sàng',
            date: '2024-01-15',
            result: 'Bệnh nhân có triệu chứng đau đầu nhẹ, không có dấu hiệu thần kinh nặng',
          },
          {
            type: 'Điện não đồ',
            date: '2024-01-15',
            result: 'Kết quả bình thường, không có dấu hiệu bất thường',
          },
        ],
        labResults: [
          {
            type: 'Xét nghiệm máu',
            date: '2024-01-15',
            result: 'Các chỉ số trong giới hạn bình thường',
          },
        ],
        prescription: [
          {
            medicine: 'Paracetamol 500mg',
            dosage: '1 viên x 3 lần/ngày',
            duration: '7 ngày',
          },
        ],
      });
    } else {
      alert('Không tìm thấy kết quả! Vui lòng kiểm tra lại mã hồ sơ.');
      setSearchResult(null);
    }
  };

  return (
    <div className="result-lookup-container">
      <div className="text-center">
        <h2 className="title">Tra Cứu Kết Quả</h2>
        <p className="subtitle">Nhập mã hồ sơ để xem kết quả khám bệnh</p>
      </div>

      {/* Form search */}
      <div className="card search-form">
        <form onSubmit={handleSearch}>
          <label htmlFor="recordCode">Mã Hồ Sơ *</label>
          <div className="input-group">
            <input
              id="recordCode"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã hồ sơ (VD: KH001)"
              required
            />
            <button type="submit">🔍</button>
          </div>
        </form>

        <div className="hint-box">
          <h4>Hướng Dẫn:</h4>
          <ul>
            <li>• Mã hồ sơ được gửi qua email sau khi hoàn thành khám</li>
            <li>• Thử với mã "KH001" để xem demo kết quả</li>
            <li>• Liên hệ hotline 0912345678 nếu không nhận được mã</li>
          </ul>
        </div>
      </div>

      {/* Kết quả */}
      {searchResult && (
        <div className="result-section-list">
          <div className="card result-section">
            <h3>Thông Tin Bệnh Nhân</h3>
            <p><strong>Họ tên:</strong> {searchResult.patientName}</p>
            <p><strong>Mã hồ sơ:</strong> {searchResult.recordCode}</p>
            <p><strong>Ngày khám:</strong> {searchResult.examDate}</p>
            <p><strong>Bác sĩ khám:</strong> {searchResult.doctor}</p>
          </div>

          <div className="card result-section">
            <h3>Chẩn Đoán</h3>
            <p>{searchResult.diagnosis}</p>
          </div>

          <div className="card result-section">
            <h3>Kết Quả Khám</h3>
            {searchResult.examResults.map((r, i) => (
              <div key={i} className="result-block">
                <strong>{r.type}</strong> <span className="small-date">{r.date}</span>
                <p>{r.result}</p>
              </div>
            ))}
          </div>

          <div className="card result-section">
            <h3>Kết Quả Xét Nghiệm</h3>
            {searchResult.labResults.map((r, i) => (
              <div key={i} className="result-block">
                <strong>{r.type}</strong> <span className="small-date">{r.date}</span>
                <p>{r.result}</p>
              </div>
            ))}
          </div>

          <div className="card result-section">
            <h3>Đơn Thuốc</h3>
            {searchResult.prescription.map((p, i) => (
              <div key={i} className="prescription-item">
                <strong>{p.medicine}</strong> - {p.dosage} ({p.duration})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultLookup;


import React, { useState } from 'react';
import { Save, FileText, Pill, TestTube, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateMedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const [recordType, setRecordType] = useState('general');
  const [formData, setFormData] = useState({
    patientId: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    testResults: '',
    recommendations: '',
    followUpDate: '',
    notes: ''
  });

  const patients = [
    { id: 1, name: 'Nguyễn Văn A', age: 35, reason: 'Đau đầu mãn tính' },
    { id: 2, name: 'Trần Thị B', age: 42, reason: 'Rối loạn giấc ngủ' },
    { id: 3, name: 'Lê Văn C', age: 28, reason: 'Stress, lo âu' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Tạo hồ sơ bệnh án thành công!');
    navigate('/doctor/queue');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/doctor/queue')}
          className="flex items-center space-x-2 text-clinic-navy hover:text-clinic-blue"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Tạo hồ sơ bệnh án
          </h1>
          <p className="text-gray-600">
            Tạo hồ sơ khám bệnh và kết quả điều trị
          </p>
        </div>
      </div>

      {/* Record Type Selection */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Loại hồ sơ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setRecordType('general')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              recordType === 'general' 
                ? 'border-clinic-navy bg-clinic-blue' 
                : 'border-gray-300 hover:border-clinic-blue'
            }`}
          >
            <FileText className="mb-2 text-clinic-navy" size={24} />
            <h3 className="font-medium text-clinic-navy mb-2">Hồ sơ tổng hợp</h3>
            <p className="text-gray-600 text-sm">Bác sĩ chính - Hồ sơ bệnh án đầy đủ</p>
          </button>
          
          <button
            onClick={() => setRecordType('examination')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              recordType === 'examination' 
                ? 'border-clinic-navy bg-clinic-blue' 
                : 'border-gray-300 hover:border-clinic-blue'
            }`}
          >
            <Pill className="mb-2 text-clinic-navy" size={24} />
            <h3 className="font-medium text-clinic-navy mb-2">Phiếu khám</h3>
            <p className="text-gray-600 text-sm">Bác sĩ phụ - Phiếu khám và đơn thuốc</p>
          </button>
          
          <button
            onClick={() => setRecordType('test')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              recordType === 'test' 
                ? 'border-clinic-navy bg-clinic-blue' 
                : 'border-gray-300 hover:border-clinic-blue'
            }`}
          >
            <TestTube className="mb-2 text-clinic-navy" size={24} />
            <h3 className="font-medium text-clinic-navy mb-2">Kết quả xét nghiệm</h3>
            <p className="text-gray-600 text-sm">Bác sĩ phụ - Kết quả và phân tích</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin bệnh nhân
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn bệnh nhân *
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Chọn bệnh nhân</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age} tuổi) - {patient.reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medical Information */}
          <div className="clinic-card">
            <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
              Thông tin khám bệnh
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triệu chứng và lý do khám *
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Mô tả triệu chứng, thời gian xuất hiện, mức độ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kết quả khám lâm sàng *
                </label>
                <textarea
                  name="examination"
                  value={formData.examination}
                  onChange={(e) => setFormData({...formData, examination: e.target.value})}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Mô tả kết quả thăm khám, các dấu hiệu phát hiện được..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chẩn đoán *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Chẩn đoán chính, chẩn đoán phụ (nếu có)..."
                />
              </div>

              {recordType !== 'test' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương pháp điều trị
                  </label>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Mô tả phương pháp điều trị, can thiệp y tế..."
                  />
                </div>
              )}

              {(recordType === 'general' || recordType === 'examination') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn thuốc
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Tên thuốc, liều dùng, cách dùng, thời gian..."
                  />
                </div>
              )}

              {(recordType === 'general' || recordType === 'test') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kết quả xét nghiệm
                  </label>
                  <textarea
                    name="testResults"
                    value={formData.testResults}
                    onChange={(e) => setFormData({...formData, testResults: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Kết quả các xét nghiệm, chỉ số, hình ảnh y học..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khuyến nghị và lưu ý
                </label>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Lời khuyên về chế độ sinh hoạt, dinh dưỡng, vận động..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày tái khám
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú khác
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Ghi chú bổ sung..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex items-center space-x-2 clinic-button-primary"
            >
              <Save size={20} />
              <span>Lưu hồ sơ</span>
            </button>
            
            <button
              type="button"
              className="px-6 py-2 clinic-button-secondary"
            >
              Lưu nháp
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;

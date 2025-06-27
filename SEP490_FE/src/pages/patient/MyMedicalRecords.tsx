
import React from 'react';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react';

const MyMedicalRecords: React.FC = () => {
  const medicalRecords = [
    {
      id: 1,
      date: '2025-06-15',
      status: 'Hoàn thành',
      type: 'Siêu âm tổng quát',
      files: ['Phiếu khám.pdf', 'Đơn thuốc.pdf']
    },
    {
      id: 2,
      date: '2025-06-10',
      status: 'Hoàn thành',
      type: 'Đo điện não đồ',
      files: ['Kết quả EEG.pdf', 'Phiếu khám.pdf']
    },
    {
      id: 3,
      date: '2025-06-05',
      status: 'Hoàn thành',
      type: 'Đo điện cơ',
      files: ['Phiếu khám.pdf']
    },
    {
      id: 4,
      date: '2025-06-05',
      status: 'Hoàn thành',
      type: 'Chẩn đoán và nhận xét',
      files: ['Phiếu khám.pdf']
    }
  ];

  const prescriptions = [
    {
      id: 1,
      date: '2025-06-15',
      doctor: 'BS. Nguyễn Văn A',
      medications: [
        { name: 'Paracetamol 500mg', dosage: '2 viên/ngày sau ăn', duration: '7 ngày' },
        { name: 'Vitamin B1', dosage: '1 viên/ngày', duration: '30 ngày' }
      ]
    },
    {
      id: 2,
      date: '2025-06-10',
      doctor: 'BS. Trần Thị B',
      medications: [
        { name: 'Melatonin 3mg', dosage: '1 viên trước khi ngủ', duration: '14 ngày' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Hồ sơ bệnh án
        </h1>
        <p className="text-gray-600">
          Xem và tải xuống hồ sơ bệnh án, kết quả khám và đơn thuốc
        </p>
      </div>

      {/* Medical Records */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Hồ sơ khám bệnh
        </h2>
        
        <div className="space-y-4">
          {medicalRecords.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-clinic-blue rounded-lg">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-clinic-navy">{record.type}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {record.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-14">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 text-clinic-navy hover:bg-gray-50 rounded-lg transition-colors">
                    <Eye size={16} />
                    <span className="text-sm">Xem</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-clinic-navy hover:bg-gray-50 rounded-lg transition-colors">
                    <Download size={16} />
                    <span className="text-sm">Tải</span>
                  </button>
                </div>
              </div>
              
              <div className="ml-14 mt-3">
                <p className="text-sm text-gray-600 mb-2">Tệp đính kèm:</p>
                <div className="flex flex-wrap gap-2">
                  {record.files.map((file, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescriptions */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Đơn thuốc
        </h2>
        
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-clinic-navy">
                    Đơn thuốc ngày {prescription.date}
                  </h3>
                  <p className="text-sm text-gray-600">Bác sĩ: {prescription.doctor}</p>
                </div>
                <button className="flex items-center space-x-1 clinic-button-secondary">
                  <Download size={16} />
                  <span>Tải đơn thuốc</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-clinic-navy">{med.name}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Liều dùng: {med.dosage}</p>
                      <p>Thời gian: {med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMedicalRecords;

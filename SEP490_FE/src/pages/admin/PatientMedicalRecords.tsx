import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@/shared/services/adminService';

const PatientMedicalRecords: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminService.getByPatientProfileMedicalRecord(id)
      .then(data => setMedicalRecord(data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      <button
        className="absolute left-0 top-0 flex items-center gap-1 text-clinic-blue hover:underline font-medium"
        onClick={() => navigate(-1)}
        style={{ top: 24, left: 24 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> Quay lại
      </button>
      <h1 className="text-2xl font-bold mb-4 text-clinic-navy text-center">Hồ sơ bệnh án của bệnh nhân</h1>
      <div className="mb-4 text-gray-700 text-center">Mã bệnh nhân: <span className="font-semibold">{id}</span></div>
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : medicalRecord ? (
          <div>
            <div><b>Mã hồ sơ:</b> {medicalRecord.medicalRecordId}</div>
            <div><b>Tiền sử bệnh:</b> {medicalRecord.medicalHistory || 'Không có'}</div>
            <div><b>Dị ứng:</b> {medicalRecord.allergies || 'Không có'}</div>
            <div><b>Tiền sử phẫu thuật:</b> {medicalRecord.surgicalHistory || 'Không có'}</div>
            <div><b>Điều trị:</b> {medicalRecord.treatment || 'Không có'}</div>
            <div><b>Thuốc đang dùng:</b> {medicalRecord.currentMedications || 'Không có'}</div>
          </div>
        ) : (
          <p>Không có dữ liệu hồ sơ bệnh án.</p>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecords; 
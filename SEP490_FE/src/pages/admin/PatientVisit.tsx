import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@/shared/services/adminService';

const PatientVisit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminService.getByPatientProfileVisit(id)
      .then(data => setVisit(data))
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
      <h1 className="text-2xl font-bold mb-4 text-clinic-navy text-center">Lịch sử khám của bệnh nhân</h1>
      <div className="mb-4 text-gray-700 text-center">Mã bệnh nhân: <span className="font-semibold">{id}</span></div>
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : visit ? (
          <pre>{JSON.stringify(visit, null, 2)}</pre>
        ) : (
          <p>Không có dữ liệu lịch sử khám.</p>
        )}
      </div>
    </div>
  );
};

export default PatientVisit; 
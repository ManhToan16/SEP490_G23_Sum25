import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '@/shared/services/appointmentService';

const PatientMedicalRecords: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    medicalHistory: '',
    allergies: '',
    surgicalHistory: '',
    treatment: '',
    currentMedications: ''
  });

  // Examination results state
  const [examinationResults, setExaminationResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    appointmentService.getMedicalRecordByPatientProfile(id)
      .then(response => {
        // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          const record = response.data[0];
          setMedicalRecord(record);
          // Cập nhật form data với dữ liệu hiện tại
          setFormData({
            medicalHistory: record.medicalHistory || '',
            allergies: record.allergies || '',
            surgicalHistory: record.surgicalHistory || '',
            treatment: record.treatment || '',
            currentMedications: record.currentMedications || ''
          });
          
          // Lấy kết quả khám sau khi có medical record
          fetchExaminationResults(record.medicalRecordId);
        } else {
          setMedicalRecord(null);
        }
      })
      .catch(error => {
        console.error('Error fetching medical record:', error);
        setMedicalRecord(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch examination results by medical record ID
  const fetchExaminationResults = async (medicalRecordId: string) => {
    setLoadingResults(true);
    setResultsError(null);
    
    try {
      const response = await appointmentService.getExaminationResultByMedicalRecord(medicalRecordId);
      
      if (response && response.success && response.data) {
        // API trả về data dưới dạng array
        setExaminationResults(Array.isArray(response.data) ? response.data : []);
      } else {
        setExaminationResults([]);
      }
    } catch (err: any) {
      let errorMessage = 'Không thể tải kết quả khám';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Không tìm thấy kết quả khám';
          setExaminationResults([]); // Không có kết quả khám là bình thường
        } else if (err.response.status === 401) {
          errorMessage = 'Không có quyền truy cập kết quả khám';
        } else {
          errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        errorMessage = 'Lỗi kết nối mạng';
      } else {
        errorMessage = err.message || 'Có lỗi xảy ra khi tải kết quả khám';
      }
      
      setResultsError(errorMessage);
      setExaminationResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalRecord?.medicalRecordId) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await appointmentService.updateMedicalRecord(
        medicalRecord.medicalRecordId, 
        formData
      );
      
      if (response && response.success) {
        setSuccess('Cập nhật hồ sơ bệnh án thành công!');
        // Cập nhật lại medicalRecord với dữ liệu mới
        setMedicalRecord(prev => ({
          ...prev,
          ...formData
        }));
      } else {
        throw new Error(response?.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      let errorMessage = 'Không thể cập nhật hồ sơ bệnh án';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Không tìm thấy hồ sơ bệnh án';
        } else if (err.response.status === 401) {
          errorMessage = 'Không có quyền cập nhật hồ sơ bệnh án';
        } else {
          errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        errorMessage = 'Lỗi kết nối mạng';
      } else {
        errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật';
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      <button
        className="absolute left-0 top-0 flex items-center gap-1 text-clinic-blue hover:underline font-medium"
        onClick={() => navigate(-1)}
        style={{ top: 24, left: 24 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> Quay lại
      </button>
      <h1 className="text-2xl font-bold mb-4 text-clinic-navy text-center">Hồ sơ y tế của bệnh nhân</h1>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : medicalRecord ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã bệnh nhân
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hồ sơ
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {medicalRecord.medicalRecordId}
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Tiền sử bệnh:
                </label>
                <div className="md:col-span-3">
                  <textarea
                    value={formData.medicalHistory}
                    placeholder="Nhập tiền sử bệnh..."
                    rows={3}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Dị ứng:
                </label>
                <div className="md:col-span-3">
                  <textarea
                    value={formData.allergies}
                    placeholder="Nhập thông tin dị ứng..."
                    rows={3}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Tiền sử phẫu thuật:
                </label>
                <div className="md:col-span-3">
                  <textarea
                    value={formData.surgicalHistory}
                    placeholder="Nhập tiền sử phẫu thuật..."
                    rows={3}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Điều trị:
                </label>
                <div className="md:col-span-3">
                  <textarea
                    value={formData.treatment}
                    placeholder="Nhập thông tin điều trị..."
                    rows={3}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Thuốc đang dùng:
                </label>
                <div className="md:col-span-3">
                  <textarea
                    value={formData.currentMedications}
                    placeholder="Nhập thông tin thuốc đang dùng..."
                    rows={3}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit button removed as per request */}
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có dữ liệu hồ sơ bệnh án.</p>
          </div>
        )}
      </div>

      {/* Examination Results Table */}
      {medicalRecord && (
        <div className="bg-white rounded shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-clinic-navy">Kết quả khám bệnh</h2>
          
          {loadingResults ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải kết quả khám...</p>
            </div>
          ) : resultsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{resultsError}</p>
            </div>
          ) : examinationResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày khám
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bác sĩ khám
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã truy cập
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examinationResults.map((result, index) => (
                    <tr key={result.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.createdAt ? formatDate(result.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.doctorName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {result.accessCode ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {result.accessCode}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có kết quả khám nào cho hồ sơ này.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords; 
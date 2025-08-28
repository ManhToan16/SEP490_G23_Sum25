import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '@/shared/services/appointmentService';

const PatientVisit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    appointmentService.getVisitByPatientProfile(id)
      .then(response => {
        console.log('Full response:', response);
        // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
        if (response && response.success && response.data) {
          // API trả về data dưới dạng array, có thể là nested array
          let visitsData = response.data;
          
          // Nếu data[0] là array chứa visits
          if (Array.isArray(visitsData) && visitsData[0] && Array.isArray(visitsData[0])) {
            visitsData = visitsData[0];
          }
          
          setVisits(Array.isArray(visitsData) ? visitsData : []);
        } else {
          setVisits([]);
        }
      })
      .catch(err => {
        console.error('Error fetching visits:', err);
        let errorMessage = 'Không thể tải lịch sử khám';
        
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = 'Không tìm thấy lịch sử khám';
            setVisits([]); // Không có lịch sử khám là bình thường
          } else if (err.response.status === 401) {
            errorMessage = 'Không có quyền truy cập lịch sử khám';
          } else {
            errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
          }
        } else if (err.request) {
          errorMessage = 'Lỗi kết nối mạng';
        } else {
          errorMessage = err.message || 'Có lỗi xảy ra khi tải lịch sử khám';
        }
        
        setError(errorMessage);
        setVisits([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Handle view detail
  const handleViewDetail = async (visitId: string) => {
    setModalLoading(true);
    setModalError(null);
    setShowModal(true);
    
    try {
      // Bước 1: Gọi 2 API song song đầu tiên
      const [visitResponse, examinationResponse] = await Promise.allSettled([
        appointmentService.getVisitById(visitId),
        appointmentService.getExaminationResultByVisitId(visitId)
      ]);

      console.log('Visit response:', visitResponse);
      console.log('Examination response:', examinationResponse);

      // Xử lý kết quả visit
      let visitData = null;
      if (visitResponse.status === 'fulfilled' && visitResponse.value?.success && visitResponse.value?.data) {
        // API trả về data dưới dạng array, lấy phần tử đầu tiên
        visitData = Array.isArray(visitResponse.value.data) ? visitResponse.value.data[0] : visitResponse.value.data;
      } else {
        throw new Error('Không thể tải thông tin visit');
      }

      // Xử lý kết quả examination
      let examinationData = null;
      if (examinationResponse.status === 'fulfilled' && examinationResponse.value?.success && examinationResponse.value?.data) {
        const examData = Array.isArray(examinationResponse.value.data) ? examinationResponse.value.data[0] : examinationResponse.value.data;
        if (examData && Object.keys(examData).length > 0) {
          examinationData = examData;
        }
      }

      // Bước 2: Nếu có examination result, gọi thêm 2 API nữa
      let laboratoryData = null;
      let prescriptionData = null;

      if (examinationData && examinationData.id) {
        const [laboratoryResponse, prescriptionResponse] = await Promise.allSettled([
          appointmentService.getLaboratoryResultByExamResult(examinationData.id),
          appointmentService.getPrescriptionByExaminationResultId(examinationData.id)
        ]);

        console.log('Laboratory response:', laboratoryResponse);
        console.log('Prescription response:', prescriptionResponse);

        // Xử lý kết quả laboratory
        if (laboratoryResponse.status === 'fulfilled' && laboratoryResponse.value?.success && laboratoryResponse.value?.data) {
          const labData = laboratoryResponse.value.data;
          console.log('Raw laboratory data:', labData);
          
          // API trả về array, nhưng cần group by assignmentId để tránh trùng lặp
          if (Array.isArray(labData) && labData.length > 0) {
            // Group by assignmentId và chỉ lấy 1 kết quả cho mỗi assignment
            const groupedByAssignment = labData.reduce((acc: any[], item: any) => {
              const existingAssignment = acc.find(existing => existing.assignmentId === item.assignmentId);
              if (!existingAssignment) {
                // Chỉ thêm nếu chưa có assignment này, ưu tiên kết quả có files
                acc.push({
                  ...item,
                  uniqueIndex: acc.length // Add unique index for React key
                });
              } else {
                // Nếu đã có assignment này, chỉ thay thế nếu kết quả mới có nhiều files hơn
                if (item.files && item.files.length > (existingAssignment.files?.length || 0)) {
                  const index = acc.findIndex(existing => existing.assignmentId === item.assignmentId);
                  acc[index] = {
                    ...item,
                    uniqueIndex: existingAssignment.uniqueIndex // Giữ nguyên uniqueIndex
                  };
                }
              }
              return acc;
            }, []);
            
            laboratoryData = groupedByAssignment;
          } else if (labData && typeof labData === 'object') {
            laboratoryData = [{...labData, uniqueIndex: 0}]; // Wrap single object thành array
          }
          
          console.log('Processed laboratory data:', laboratoryData);
          console.log('Laboratory data details (after grouping by assignment):');
          laboratoryData?.forEach((item, index) => {
            console.log(`Lab result ${index}:`, {
              id: item.id,
              assignmentId: item.assignmentId,
              technicianName: item.technicianName,
              filesCount: item.files?.length || 0,
              note: item.note,
              uniqueIndex: item.uniqueIndex
            });
          });
        }

        // Xử lý kết quả prescription
        if (prescriptionResponse.status === 'fulfilled' && prescriptionResponse.value?.success && prescriptionResponse.value?.data) {
          const prescData = Array.isArray(prescriptionResponse.value.data) ? prescriptionResponse.value.data[0] : prescriptionResponse.value.data;
          if (prescData && Object.keys(prescData).length > 0) {
            prescriptionData = prescData;
          }
        }
      }

      // Kết hợp tất cả dữ liệu
      const combinedData = {
        ...visitData,
        examinationResult: examinationData,
        laboratoryResults: laboratoryData,
        prescription: prescriptionData
      };

      setSelectedVisit(combinedData);
      
    } catch (err: any) {
      let errorMessage = 'Không thể tải chi tiết visit';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Không tìm thấy thông tin visit';
        } else if (err.response.status === 401) {
          errorMessage = 'Không có quyền truy cập thông tin visit';
        } else {
          errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        errorMessage = 'Lỗi kết nối mạng';
      } else {
        errorMessage = err.message || 'Có lỗi xảy ra khi tải chi tiết visit';
      }
      
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVisit(null);
    setModalError(null);
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
    <div className="p-8 max-w-5xl mx-auto relative">
      <button
        className="absolute left-0 top-0 flex items-center gap-1 text-clinic-blue hover:underline font-medium"
        onClick={() => navigate(-1)}
        style={{ top: 24, left: 24 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> Quay lại
      </button>
      
      <h1 className="text-2xl font-bold mb-4 text-clinic-navy text-center">Lịch sử khám của bệnh nhân</h1>
      <div className="mb-6 text-gray-700 text-center">Mã bệnh nhân: <span className="font-semibold">{id}</span></div>
      
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải lịch sử khám...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bác sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visits.map((visit, index) => (
                  <tr key={visit.visitId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.examinationRoomName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.assignedDoctorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        visit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        visit.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {visit.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetail(visit.visitId)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có lịch sử khám nào cho bệnh nhân này.</p>
          </div>
        )}
      </div>

      {/* Visit Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết lượt khám
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4">
                {modalLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
                    <p className="text-gray-500 mt-2">Đang tải chi tiết...</p>
                  </div>
                ) : modalError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{modalError}</p>
                  </div>
                ) : selectedVisit ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phòng khám
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedVisit.examinationRoomName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bác sĩ phụ trách
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedVisit.assignedDoctorName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên bệnh nhân
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedVisit.patientName || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Examination Result Section */}
                    {selectedVisit.examinationResult && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Kết quả khám bệnh</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tóm tắt khám bệnh
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[60px]">
                              {selectedVisit.examinationResult.summary || 'Chưa có thông tin'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kết luận
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[60px]">
                              {selectedVisit.examinationResult.conclusion || 'Chưa có thông tin'}
                            </div>
                          </div>
                          {selectedVisit.examinationResult.accessCode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã truy cập
                              </label>
                              <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded font-mono">
                                {selectedVisit.examinationResult.accessCode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Laboratory Results Section */}
                    {selectedVisit.laboratoryResults && selectedVisit.laboratoryResults.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="text-lg font-semibold text-gray-900">Kết quả xét nghiệm</h4>
                        </div>
                        
                        {/* Hiển thị từng kết quả xét nghiệm riêng biệt */}
                        <div className="space-y-6">
                          {selectedVisit.laboratoryResults.map((labResult: any, resultIndex: number) => (
                            <div key={`lab-${resultIndex}-${labResult.assignmentId || 'no-assignment'}-${labResult.id || 'no-id'}`} className="bg-gray-50 rounded-lg p-4">
                              {/* Header cho từng kết quả */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {resultIndex + 1}
                                </div>
                                <h5 className="text-md font-semibold text-gray-900">
                                  Kết quả xét nghiệm {resultIndex + 1}
                                </h5>
                              </div>
                              
                              {/* Thông tin kết quả */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Kỹ thuật viên
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {labResult.technicianName || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Ngày cập nhật
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {labResult.updatedAt ? 
                                      new Date(labResult.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Assignment ID
                                  </label>
                                  <p className="text-sm text-gray-900 font-mono text-xs">
                                    {labResult.assignmentId ? labResult.assignmentId.substring(0, 8) + '...' : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Ghi chú */}
                              {labResult.note && (
                                <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Ghi chú
                                  </label>
                                  <p className="text-sm text-gray-900 bg-white p-2 rounded">
                                    {labResult.note}
                                  </p>
                                </div>
                              )}
                              
                              {/* File ảnh kết quả của kết quả này */}
                              {labResult.files && labResult.files.length > 0 ? (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">
                                    File ảnh kết quả ({labResult.files.length} file)
                                  </label>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {labResult.files.map((file: any, fileIndex: number) => (
                                      <div key={file.id || fileIndex} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                        {/* Image Thumbnail */}
                                        <div className="aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden">
                                          {file.url ? (
                                            <img 
                                              src={file.url} 
                                              alt={`Kết quả ${resultIndex + 1} - File ${fileIndex + 1}`}
                                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                              onClick={() => window.open(file.url, '_blank')}
                                              onError={(e) => {
                                                // Fallback nếu không load được ảnh
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                              }}
                                            />
                                          ) : null}
                                          {/* Fallback icon nếu không có ảnh */}
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 hidden">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </div>
                                        </div>
                                        
                                        {/* File Info */}
                                        <div className="text-center">
                                          <p className="text-xs font-medium text-gray-900 mb-1">
                                            File {fileIndex + 1}
                                          </p>
                                          
                                          {/* View Button */}
                                          {file.url && (
                                            <button
                                              onClick={() => window.open(file.url, '_blank')}
                                              className="w-full px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                            >
                                              Xem
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-xs">Chưa có file ảnh cho kết quả này</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescription Section */}
                    {selectedVisit.prescription && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Đơn thuốc</h4>
                        <div className="space-y-4">
                          {selectedVisit.prescription.note && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú đơn thuốc
                              </label>
                              <div className="text-sm text-gray-900 bg-green-50 p-3 rounded">
                                {selectedVisit.prescription.note}
                              </div>
                            </div>
                          )}
                          
                          {selectedVisit.prescription.items && selectedVisit.prescription.items.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh sách thuốc
                              </label>
                              <div className="space-y-3">
                                {selectedVisit.prescription.items.map((item: any, index: number) => (
                                  <div key={item.id || index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="font-medium text-gray-900">
                                          {item.medicineName || item.name || 'N/A'}
                                        </span>
                                      </div>
                                                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                         <div className="text-sm text-gray-600">
                                           Liều dùng: {item.dosage || 'N/A'}
                                         </div>
                                         <div className="text-sm text-gray-600">
                                           Tần suất: {item.frequency || 'N/A'}
                                         </div>
                                         <div className="text-sm text-gray-600">
                                           Thời gian: {item.duration || 'N/A'}
                                         </div>
                                         {item.instructions && (
                                           <div className="text-sm text-gray-600">
                                             Hướng dẫn: {item.instructions}
                                           </div>
                                         )}
                                       </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* No Examination Result Message */}
                    {!selectedVisit.examinationResult && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">Chưa có kết quả khám bệnh cho lượt khám này</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVisit; 
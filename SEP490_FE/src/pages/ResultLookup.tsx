
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Search, FileText, Calendar, User, X, Eye } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';
import { appointmentService } from '@/shared/services/appointmentService';

const ResultLookup = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const { toast } = useToast();

  // Modal kết quả xét nghiệm states
  const [showLabResultModal, setShowLabResultModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [laboratoryResult, setLaboratoryResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  // Fetch kết quả xét nghiệm theo assignmentId
  const fetchLaboratoryResult = async (assignmentId) => {
    setLoadingResult(true);
    try {
      const response = await appointmentService.getLaboratoryResultByAssignmentId(assignmentId);
      console.log('Laboratory result response:', response);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && response.data && Array.isArray(response.data) && response.data[0]) {
        console.log('Laboratory result data structure:', response.data[0]);
        console.log('Files in result:', response.data[0].files);
        setLaboratoryResult(response.data[0]);
      } else {
        setLaboratoryResult(null);
      }
    } catch (error) {
      console.error('Error fetching laboratory result:', error);
      setLaboratoryResult(null);
      toast({
        title: "Lỗi",
        description: "Không thể tải kết quả xét nghiệm. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoadingResult(false);
    }
  };

  // Handle view room detail
  const handleViewRoomDetail = async (room) => {
    // Chỉ cho phép xem chi tiết khi trạng thái là COMPLETED
    if (room.status !== 'COMPLETED') {
      toast({
        title: "Thông báo",
        description: "Chỉ có thể xem chi tiết khi xét nghiệm đã hoàn thành",
        variant: "default"
      });
      return;
    }

    setSelectedAssignment(room);
    setShowLabResultModal(true);
    
    // Fetch kết quả xét nghiệm
    if (room.assignmentId) {
      await fetchLaboratoryResult(room.assignmentId);
    }
  };

  // Fetch assignments từ visitId
  const fetchAssignments = async (visitId) => {
    if (!visitId) {
      setAssignments([]);
      return;
    }

    setLoadingAssignments(true);
    try {
      console.log('Fetching assignments for visitId:', visitId);
      
      const response = await appointmentService.getAssignmentByVisitId(visitId);
      console.log('Assignment response:', response);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && response.statusCode === 200 && response.success) {
        console.log('Assignment data structure:', response.data);
        
        // Parse dữ liệu từ API response
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Flatten array vì data là array của arrays
          const flattenedData = response.data.flat();
          console.log('Flattened data:', flattenedData);
          
          // Map từng item thành room object
          const roomsData = flattenedData.map((item, index) => {
            console.log(`Processing item ${index}:`, item);
            return {
              roomId: item.laboratoryRoomId,
              roomName: item.laboratoryRoomName,
              status: item.status,
              totalPrice: item.totalPrice,
              visitId: item.visitId,
              patientName: item.patientName,
              assignmentId: item.assignmentId,
              services: item.assignmentServices || [] // Array các services
            };
          });
          console.log('Final processed rooms data:', roomsData);
          setAssignments(roomsData);
        } else {
          console.log('No data found in response');
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Fetch prescription từ examination result ID
  const fetchPrescription = async (examinationResultId) => {
    if (!examinationResultId) {
      setPrescription(null);
      return;
    }

    setLoadingPrescription(true);
    try {
      const response = await appointmentService.getPrescriptionByExaminationResultId(examinationResultId);
      console.log('Prescription response:', response);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && response.statusCode === 200 && response.success) {
        const prescriptionData = Array.isArray(response.data) ? response.data[0] : response.data;
        setPrescription(prescriptionData);
      } else {
        setPrescription(null);
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      setPrescription(null);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã hồ sơ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await appointmentService.findByAccessCode(searchCode.trim());
      
      console.log('Search result response:', response);

      // Kiểm tra response structure
      if (response && response.statusCode === 200 && response.success) {
        // Lấy data từ response (có thể là array hoặc object)
        const resultData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (resultData) {
          setSearchResult(resultData);
          setShowResultModal(true);
          
          // Fetch assignments và prescription
          if (resultData.visitId) {
            fetchAssignments(resultData.visitId);
          }
          if (resultData.id) {
            fetchPrescription(resultData.id);
          }
          
          toast({
            title: "Thành công",
            description: "Đã tìm thấy kết quả khám",
            variant: "default"
          });
        } else {
          throw new Error('Không có dữ liệu kết quả');
        }
      } else {
        throw new Error(response?.message || 'Không tìm thấy kết quả');
      }
    } catch (error) {
      console.error('Error searching by access code:', error);
      
      toast({
        title: "Không tìm thấy kết quả",
        description: error?.message || "Vui lòng kiểm tra lại mã hồ sơ",
        variant: "destructive"
      });
      
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tra Cứu Kết Quả</h2>
        <p className="text-lg text-gray-600">
          Nhập mã hồ sơ để xem kết quả khám bệnh
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="max-w-md mx-auto">
            <Label htmlFor="recordCode" className="text-lg font-semibold">
              Mã Hồ Sơ *
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="recordCode"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã hồ sơ (VD: KH001)"
                className="text-lg"
                required
              />
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Hướng Dẫn:</h3>
          <ul className="space-y-1 text-blue-700 text-sm">
            <li>• Mã hồ sơ được gửi qua email sau khi hoàn thành khám</li>
            <li>• Nhập chính xác mã hồ sơ để tra cứu kết quả</li>
            <li>• Liên hệ hotline 0912345678 nếu không nhận được mã</li>
          </ul>
        </div>
      </Card>

      {/* Result Modal */}
      {showResultModal && searchResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kết Quả Khám</h1>
                <p className="text-gray-600 mt-1">
                  Bệnh nhân: {searchResult.patientName || 'Không có thông tin'} - Mã hồ sơ: {searchResult.accessCode || searchResult.recordCode || 'Không có thông tin'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResultModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Thông tin bệnh nhân */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <User size={20} className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin bệnh nhân</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tên bệnh nhân
                    </label>
                    <p className="text-gray-900 font-medium">{searchResult.patientName || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Mã hồ sơ
                    </label>
                    <p className="text-gray-900">{searchResult.accessCode || searchResult.recordCode || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Ngày khám
                    </label>
                    <p className="text-gray-900">
                      {searchResult.createdAt || searchResult.examDate 
                        ? new Date(searchResult.createdAt || searchResult.examDate).toLocaleDateString('vi-VN')
                        : 'Không có thông tin'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Bác sĩ khám
                    </label>
                    <p className="text-gray-900">{searchResult.doctorName || searchResult.doctor || 'Không có thông tin'}</p>
                  </div>
                </div>
              </Card>

              {/* Danh sách phòng chỉ định */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh sách phòng chỉ định
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Tên phòng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Dịch vụ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loadingAssignments ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Đang tải danh sách phòng chỉ định...</span>
                            </div>
                          </td>
                        </tr>
                      ) : assignments && Array.isArray(assignments) && assignments.length > 0 ? assignments.map((room, index) => (
                        <tr key={room.roomId || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {room.roomName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              room.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {room.status === 'COMPLETED' ? 'Hoàn thành' : room.status || 'Chưa xác định'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {room.services && Array.isArray(room.services) && room.services.length > 0 ? 
                                room.services.map(service => service.serviceName).join(', ') : 
                                'Không có dịch vụ'
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {room.services && Array.isArray(room.services) ? room.services.length : 0} dịch vụ
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRoomDetail(room)}
                              disabled={room.status !== 'COMPLETED'}
                              className={`${
                                room.status === 'COMPLETED' 
                                  ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Eye size={16} className="mr-1" />
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            Không có dữ liệu phòng chỉ định
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Chẩn đoán sơ bộ */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chẩn đoán sơ bộ
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{searchResult.summary || searchResult.diagnosis || 'Chưa có chẩn đoán'}</p>
                </div>
              </Card>

              {/* Kết luận */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Kết luận
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{searchResult.conclusion || 'Chưa có kết luận'}</p>
                </div>
              </Card>

              {/* Đơn thuốc */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Đơn thuốc
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          STT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Tên thuốc
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Liều lượng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Tần xuất
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Hướng dẫn
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loadingPrescription ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Đang tải đơn thuốc...</span>
                            </div>
                          </td>
                        </tr>
                      ) : prescription && prescription.items && Array.isArray(prescription.items) && prescription.items.length > 0 ? prescription.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.medicineName || item.medicine?.name || 'Không có tên thuốc'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.medicine?.activeIngredients || item.activeIngredient || ''} 
                              {item.medicine?.strength && ` • ${item.medicine.strength}`}
                              {item.medicine?.packaging && ` • ${item.medicine.packaging}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.dosage || 'Không có thông tin'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.frequency || 'Không có thông tin'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.duration || 'Không có thông tin'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {item.instructions || item.usageNote || 'Không có hướng dẫn đặc biệt'}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            Không có đơn thuốc
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button
                onClick={() => setShowResultModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal kết quả xét nghiệm */}
      {showLabResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Kết quả xét nghiệm - {selectedAssignment?.roomName}
              </h3>
              <button
                onClick={() => {
                  setShowLabResultModal(false);
                  setSelectedAssignment(null);
                  setLaboratoryResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Loading State */}
            {loadingResult && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải kết quả xét nghiệm...</span>
                </div>
              </div>
            )}

            {/* Content */}
            {!loadingResult && (
              <div className="space-y-6">
                {/* Thông tin assignment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chỉ định</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phòng xét nghiệm
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAssignment?.roomName || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Trạng thái
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedAssignment?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedAssignment?.status === 'COMPLETED' ? 'Hoàn thành' : selectedAssignment?.status || 'Chưa xác định'}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Dịch vụ
                      </label>
                      <p className="text-gray-900">
                        {selectedAssignment?.services && selectedAssignment.services.length > 0 
                          ? selectedAssignment.services.map(service => service.serviceName).join(', ')
                          : 'Chưa có dịch vụ'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kết quả xét nghiệm */}
                {laboratoryResult ? (
                  <div className="space-y-6">
                    {/* Ghi chú */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <FileText size={20} className="text-blue-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-900">Ghi chú</h4>
                      </div>
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {laboratoryResult.note || 'Không có ghi chú'}
                        </p>
                      </div>
                    </div>

                    {/* File ảnh kết quả */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <FileText size={20} className="text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-900">File ảnh kết quả</h4>
                      </div>
                      
                      {laboratoryResult.files && laboratoryResult.files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {laboratoryResult.files.map((file, index) => (
                            <div key={file.id || index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {/* Preview ảnh */}
                              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                {file.url ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.fileName || `Kết quả ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className="hidden flex-col items-center justify-center text-gray-400">
                                  <FileText size={48} />
                                  <span className="text-sm mt-2">Không thể hiển thị</span>
                                </div>
                              </div>
                              
                              {/* Thông tin file */}
                              <div className="p-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={file.fileName || file.url}>
                                  {file.fileName || `Kết quả ${index + 1}`}
                                </p>
                                
                                {/* Button xem */}
                                <div className="mt-2">
                                  {file.url && (
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                    >
                                      Xem
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-8 rounded border border-gray-200 text-center">
                          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">Chưa có file ảnh kết quả</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Chưa có kết quả xét nghiệm</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowLabResultModal(false);
                  setSelectedAssignment(null);
                  setLaboratoryResult(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultLookup;

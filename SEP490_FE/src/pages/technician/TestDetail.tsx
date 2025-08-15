import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, Download, FileText, Upload, Save, X, Image, Trash2, User, Calendar, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import TechnicianLayout from '@/shared/components/layouts/TechnicianLayout';
import { useAuth } from '../../shared/hooks/business/useAuth';
import { appointmentService } from '../../shared/services/appointmentService';
import { adminService } from '../../shared/services/adminService';
import { useToast } from '@/shared/components/ui/use-toast';

interface TestDetailData {
  id: string;
  patientName: string;
  patientId: string;
  testType: string;
  scheduledTime: string;
  status: string;
  priority: string;
  notes?: string;
  serviceName?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  isServerFile?: boolean; // Đánh dấu file có ID từ server
}

const TestDetail: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [testData, setTestData] = useState<TestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [assignmentServices, setAssignmentServices] = useState<any[]>([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [visitData, setVisitData] = useState<any>(null);
  const [laboratoryResultId, setLaboratoryResultId] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      fetchTestDetail(testId);
    }
  }, [testId]);

  const fetchTestDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [TEST DETAIL] Starting to fetch assignment and laboratory result details for assignmentId:', id);
      
      // Gọi 2 API song song
      const [assignmentResponse, laboratoryResultResponse] = await Promise.allSettled([
        appointmentService.getAssignmentById(id),
        appointmentService.getLaboratoryResultByAssignmentId(id)
      ]);

      console.log('📊 [TEST DETAIL] API responses:', {
        assignmentResponse,
        laboratoryResultResponse
      });

      // Xử lý kết quả assignment
      let assignmentData = null;
      if (assignmentResponse.status === 'fulfilled' && assignmentResponse.value?.data) {
        assignmentData = assignmentResponse.value.data[0]; // API trả về array
        console.log('✅ [TEST DETAIL] Assignment data loaded successfully:', assignmentData);
      } else {
        console.error('❌ [TEST DETAIL] Failed to load assignment data:', assignmentResponse);
        throw new Error('Không thể tải thông tin assignment');
      }

      // Lấy thông tin chi tiết visit để có đầy đủ thông tin bệnh nhân
      let visitData = null;
      if (assignmentData?.visitId) {
        try {
          console.log('🔍 [TEST DETAIL] Fetching visit details for visitId:', assignmentData.visitId);
          const visitResponse = await appointmentService.getVisitByVisitId(assignmentData.visitId);
          
          if (visitResponse?.data) {
            visitData = visitResponse.data[0]; // API trả về array
            console.log('✅ [TEST DETAIL] Visit data loaded successfully:', visitData);
          } else {
            console.log('⚠️ [TEST DETAIL] No visit data found');
          }
        } catch (visitError: any) {
          console.error('❌ [TEST DETAIL] Error fetching visit data:', visitError);
        }
      } else {
        console.log('⚠️ [TEST DETAIL] No visitId found in assignment data');
      }

      // Xử lý kết quả laboratory result
      let laboratoryResultData = null;
      if (laboratoryResultResponse.status === 'fulfilled' && laboratoryResultResponse.value?.data) {
        const labData = laboratoryResultResponse.value.data[0]; // API trả về array
        if (labData && Object.keys(labData).length > 0) {
          laboratoryResultData = labData;
          console.log('✅ [TEST DETAIL] Laboratory result found:', laboratoryResultData);
        } else {
          console.log('⚠️ [TEST DETAIL] Laboratory result is empty, will create new one');
        }
      } else {
        console.log('⚠️ [TEST DETAIL] No laboratory result found or API failed, will create new one');
      }

      // Nếu chưa có laboratory result, tạo mới
      if (!laboratoryResultData) {
        try {
          console.log('🆕 [TEST DETAIL] Creating new laboratory result for assignmentId:', id);
          
          // Tạo laboratory result mới với dữ liệu mặc định
          const defaultLaboratoryData = {
            note: ''
          };

          const createResponse = await appointmentService.createLaboratoryResult(id, defaultLaboratoryData);
          
          if (createResponse?.data) {
            laboratoryResultData = createResponse.data[0]; // API trả về array
            console.log('✅ [TEST DETAIL] New laboratory result created successfully:', laboratoryResultData);
          } else {
            console.error('❌ [TEST DETAIL] Failed to create laboratory result');
          }
        } catch (createError: any) {
          console.error('❌ [TEST DETAIL] Error creating laboratory result:', createError);
          // Tiếp tục với dữ liệu assignment ngay cả khi tạo laboratory result thất bại
        }
      }

      // Lưu laboratoryResultId để sử dụng cho upload files
      if (laboratoryResultData?.id) {
        setLaboratoryResultId(laboratoryResultData.id);
        console.log('💾 [TEST DETAIL] Laboratory result ID saved:', laboratoryResultData.id);
      }

      // Load files đã có từ laboratory result
      let existingFiles: UploadedFile[] = [];
      
      // Kiểm tra nhiều cấu trúc có thể cho files
      if (laboratoryResultData?.files && Array.isArray(laboratoryResultData.files) && laboratoryResultData.files.length > 0) {
        console.log('📁 [TEST DETAIL] Loading existing files from laboratory result:', laboratoryResultData.files);
        
        existingFiles = laboratoryResultData.files.map((fileData: any, index: number) => {
          console.log(`📁 [FILE ${index}] Processing file data:`, fileData);
          
          // Xử lý nhiều format tên file có thể - ưu tiên tên gốc có extension
          let fileName = '';
          
          // Ưu tiên tên có extension thật
          if (fileData.originalName && fileData.originalName.includes('.') && !fileData.originalName.endsWith('.file')) {
            fileName = fileData.originalName;
          } else if (fileData.name && fileData.name.includes('.') && !fileData.name.endsWith('.file')) {
            fileName = fileData.name;
          } else if (fileData.fileName && fileData.fileName.includes('.') && !fileData.fileName.endsWith('.file')) {
            fileName = fileData.fileName;
          } else if (fileData.name) {
            fileName = fileData.name;
          } else if (fileData.fileName) {
            fileName = fileData.fileName;
          } else if (fileData.originalName) {
            fileName = fileData.originalName;
          } else if (fileData.id) {
            fileName = `${fileData.id}.file`; // Fallback cuối cùng
          } else {
            fileName = `File_${index + 1}`;
          }
          
          console.log(`📁 [FILE ${index}] Resolved fileName:`, fileName, {
            original: fileData.originalName,
            name: fileData.name,
            fileName: fileData.fileName
          });
          
          // Xử lý URL file - cải thiện logic tạo URL
          let fileUrl = '';
          if (fileData.url) {
            fileUrl = fileData.url;
          } else if (fileData.Url) {
            fileUrl = fileData.Url;
          } else if (fileData.path) {
            fileUrl = fileData.path;
          } else if (fileData.id || fileData.Id) {
            // Tạo URL từ ID nếu không có URL trực tiếp
            const fileId = fileData.id || fileData.Id;
            
            // Lấy extension từ nhiều nguồn có thể
            let extension = '';
            
            // 1. Từ tên file gốc
            if (fileData.originalName && fileData.originalName.includes('.') && !fileData.originalName.endsWith('.file')) {
              extension = '.' + fileData.originalName.split('.').pop();
            } else if (fileData.name && fileData.name.includes('.') && !fileData.name.endsWith('.file')) {
              extension = '.' + fileData.name.split('.').pop();
            } else if (fileName && fileName.includes('.') && !fileName.endsWith('.file')) {
              extension = '.' + fileName.split('.').pop();
            }
            
            // 2. Từ file type nếu không có extension
            if (!extension && (fileData.type || fileData.contentType)) {
              const mimeType = fileData.type || fileData.contentType;
              if (mimeType.includes('image/png')) extension = '.png';
              else if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) extension = '.jpg';
              else if (mimeType.includes('image/gif')) extension = '.gif';
              else if (mimeType.includes('image/webp')) extension = '.webp';
              else if (mimeType.includes('application/pdf')) extension = '.pdf';
            }
            
            // 3. Fallback - thử các extension phổ biến
            if (!extension) {
              // Thử .png trước vì phổ biến nhất cho ảnh y tế
              extension = '.png';
            }
            
            fileUrl = `https://be.khanhanclinic.io.vn/uploads/laboratory/${fileId}${extension}`;
            console.log(`📁 [FILE ${index}] Created URL from ID:`, { 
              fileId, 
              extension, 
              fileName, 
              originalName: fileData.originalName,
              mimeType: fileData.type || fileData.contentType,
              finalUrl: fileUrl
            });
          }
          
          console.log(`📁 [FILE ${index}] Resolved fileUrl:`, fileUrl);
          
          // Xử lý type file - cải thiện logic detect
          let fileType = fileData.type || fileData.contentType || 'unknown';
          
          // Nếu chưa có type, thử detect từ extension trong URL hoặc fileName
          if (fileType === 'unknown' || !fileType.startsWith('image/')) {
            let extensionToCheck = '';
            
            // Lấy extension từ URL nếu có
            if (fileUrl && fileUrl.includes('.')) {
              extensionToCheck = fileUrl.split('.').pop()?.toLowerCase() || '';
            }
            // Hoặc từ fileName
            else if (fileName && fileName.includes('.')) {
              extensionToCheck = fileName.split('.').pop()?.toLowerCase() || '';
            }
            
            // Map extension to MIME type
            if (extensionToCheck) {
              if (['jpg', 'jpeg'].includes(extensionToCheck)) {
                fileType = 'image/jpeg';
              } else if (extensionToCheck === 'png') {
                fileType = 'image/png';
              } else if (extensionToCheck === 'gif') {
                fileType = 'image/gif';
              } else if (extensionToCheck === 'webp') {
                fileType = 'image/webp';
              } else if (extensionToCheck === 'bmp') {
                fileType = 'image/bmp';
              } else if (extensionToCheck === 'pdf') {
                fileType = 'application/pdf';
              }
            }
          }
          
          console.log(`📁 [FILE ${index}] Resolved fileType:`, fileType, {
            originalType: fileData.type || fileData.contentType,
            detectedFromUrl: fileUrl,
            detectedFromName: fileName
          });
          
          const processedFile = {
            id: fileData.id || fileData.Id || `existing_${Date.now()}_${index}`,
            name: fileName,
            size: fileData.size || fileData.fileSize || 0,
            type: fileType,
            url: fileUrl,
            isServerFile: true // Đánh dấu là file từ server
          };
          
          console.log(`📁 [FILE ${index}] Final processed file:`, processedFile);
          return processedFile;
        });
        
        console.log('✅ [TEST DETAIL] Processed', existingFiles.length, 'existing files:', existingFiles);
      } else {
        console.log('📁 [TEST DETAIL] No existing files found in laboratory result');
      }
      
      setUploadedFiles(existingFiles);

      // Chuyển đổi dữ liệu assignment và visit thành format TestDetailData
      const testDetailData: TestDetailData = {
        id: assignmentData?.id || id,
        patientName: visitData?.patientName || assignmentData?.patientName || 'N/A',
        patientId: visitData?.patientProfileId || assignmentData?.patientId || 'N/A',
        testType: assignmentData?.serviceName || 'Xét nghiệm',
        scheduledTime: assignmentData?.scheduledTime || 'N/A',
        status: assignmentData?.status || 'in-progress',
        priority: visitData?.isPrioritized ? 'urgent' : 'normal',
        serviceName: assignmentData?.serviceName || 'N/A',
        notes: laboratoryResultData?.note || ''
      };
      
      console.log('🎉 [TEST DETAIL] Final test detail data:', testDetailData);
      
      // Lưu thông tin assignment services
      if (assignmentData?.assignmentServices && Array.isArray(assignmentData.assignmentServices)) {
        setAssignmentServices(assignmentData.assignmentServices);
        console.log('📋 [TEST DETAIL] Assignment services:', assignmentData.assignmentServices);
      } else {
        setAssignmentServices([]);
        console.log('⚠️ [TEST DETAIL] No assignment services found');
      }

      // Lưu thông tin visit data
      if (visitData) {
        setVisitData(visitData);
        console.log('🏥 [TEST DETAIL] Visit data saved to state:', visitData);
      } else {
        setVisitData(null);
        console.log('⚠️ [TEST DETAIL] No visit data to save');
      }
      
      setTestData(testDetailData);
      setNotes(testDetailData.notes || '');
      
    } catch (error: any) {
      console.error('❌ [TEST DETAIL] Error in fetchTestDetail:', error);
      setError(error?.message || 'Không thể tải thông tin xét nghiệm');
    } finally {
      setLoading(false);
      console.log('🏁 [TEST DETAIL] API calls completed, loading set to false');
    }
  };

  const handleCompleteTest = async () => {
    if (!testId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin assignment',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🏁 [COMPLETE] Completing assignment:', testId);
      
      // Trước tiên lưu ghi chú nếu có laboratoryResultId
      if (laboratoryResultId && notes.trim()) {
        try {
          const updateData = { note: notes };
          await appointmentService.updateLaboratoryResult(laboratoryResultId, updateData);
          console.log('✅ [COMPLETE] Notes saved before completing');
        } catch (saveError: any) {
          console.error('⚠️ [COMPLETE] Error saving notes, but continuing with completion:', saveError);
        }
      }
      
      // Gọi API completedAssignment
      const completeResponse = await appointmentService.completedAssignment(testId);
      
      console.log('✅ [COMPLETE] Assignment completed successfully:', completeResponse);
      toast({
        title: "Thành công!",
        description: 'Hoàn thành xét nghiệm thành công!',
        variant: "success",
      });
      navigate('/technician/test-schedule');
      
    } catch (error: any) {
      console.error('❌ [COMPLETE] Error completing assignment:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi hoàn thành xét nghiệm: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!laboratoryResultId) {
      toast({
        title: "Lỗi!",
        description: 'Chưa có thông tin kết quả xét nghiệm để lưu',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('💾 [SAVE] Saving laboratory result with notes:', notes);
      
      // Gọi API updateLaboratoryResult
      const updateData = {
        note: notes
      };
      
      const updateResponse = await appointmentService.updateLaboratoryResult(laboratoryResultId, updateData);
      
      console.log('✅ [SAVE] Laboratory result updated successfully:', updateResponse);
      toast({
        title: "Thành công!",
        description: 'Lưu thông tin thành công!',
        variant: "success",
      });
      
    } catch (error: any) {
      console.error('❌ [SAVE] Error saving laboratory result:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi lưu: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/technician/test-schedule');
  };

  const handleViewPatientInfo = async () => {
    if (!testData?.patientId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin bệnh nhân',
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingPatient(true);
      setShowPatientModal(true);
      
      console.log('🔍 [PATIENT INFO] Fetching patient details for patientId:', testData.patientId);
      
      const patientData = await adminService.getPatientById(testData.patientId);
      
      console.log('✅ [PATIENT INFO] Patient data loaded successfully:', patientData);
      setPatientDetails(patientData);
      
    } catch (error: any) {
      console.error('❌ [PATIENT INFO] Error fetching patient details:', error);
      toast({
        title: "Lỗi!",
        description: 'Không thể tải thông tin bệnh nhân',
        variant: "destructive",
      });
      setShowPatientModal(false);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !laboratoryResultId) {
      if (!laboratoryResultId) {
        toast({
          title: "Lỗi!",
          description: 'Chưa có thông tin kết quả xét nghiệm để upload file',
          variant: "destructive",
        });
      }
      return;
    }

    try {
      console.log('📤 [FILE UPLOAD] Starting to upload files for laboratoryResultId:', laboratoryResultId);
      
      // Gọi API uploadFiles
      const filesArray = Array.from(files);
      const uploadResponse = await appointmentService.uploadFiles(laboratoryResultId, filesArray);
      
      console.log('✅ [FILE UPLOAD] Files uploaded successfully:', uploadResponse);
      
      // Cập nhật UI với files đã upload thành công
      let filesAdded = false;
      
      // Kiểm tra nhiều cấu trúc response có thể
      if (uploadResponse?.data && Array.isArray(uploadResponse.data)) {
        // Trường hợp 1: uploadResponse.data là array trực tiếp
        const uploadedFilesData = uploadResponse.data.map((fileData: any, index: number) => {
          const originalFile = filesArray[index];
          
          // Xử lý URL file - ưu tiên URL từ server
          let fileUrl = '';
          if (fileData.url) {
            fileUrl = fileData.url;
          } else if (fileData.Url) {
            fileUrl = fileData.Url;
          } else if (fileData.id && originalFile) {
            // Tạo URL dựa trên ID từ server và extension của file gốc
            const extension = originalFile.name.split('.').pop() || '';
            fileUrl = `https://be.khanhanclinic.io.vn/uploads/laboratory/${fileData.id}${extension ? '.' + extension : ''}`;
          } else if (originalFile) {
            // Fallback cuối cùng
            fileUrl = URL.createObjectURL(originalFile);
          }
          
          console.log(`📤 [FILE UPLOAD] File ${index} URL processing:`, {
            serverUrl: fileData.url || fileData.Url,
            fileId: fileData.id,
            originalName: originalFile?.name,
            finalUrl: fileUrl
          });
          
          return {
            id: fileData.id || fileData.Id || `temp_${Date.now()}_${index}`, // Ưu tiên ID từ server
            name: originalFile?.name || fileData.name || fileData.fileName || 'Unknown',
            size: originalFile?.size || fileData.size || fileData.fileSize || 0,
            type: originalFile?.type || fileData.type || fileData.contentType || 'unknown',
            url: fileUrl,
            isServerFile: !!(fileData.id || fileData.Id) // Đánh dấu file có ID từ server
          };
        });
        
        setUploadedFiles(prev => [...prev, ...uploadedFilesData]);
        filesAdded = true;
      } else if (uploadResponse?.data?.data && Array.isArray(uploadResponse.data.data)) {
        // Trường hợp 2: uploadResponse.data.data là array
        const uploadedFilesData = uploadResponse.data.data.map((fileData: any, index: number) => {
          const originalFile = filesArray[index];
          
          // Xử lý URL file - ưu tiên URL từ server
          let fileUrl = '';
          if (fileData.url) {
            fileUrl = fileData.url;
          } else if (fileData.Url) {
            fileUrl = fileData.Url;
          } else if (fileData.id && originalFile) {
            // Tạo URL dựa trên ID từ server và extension của file gốc
            const extension = originalFile.name.split('.').pop() || '';
            fileUrl = `https://be.khanhanclinic.io.vn/uploads/laboratory/${fileData.id}${extension ? '.' + extension : ''}`;
          } else if (originalFile) {
            // Fallback cuối cùng
            fileUrl = URL.createObjectURL(originalFile);
          }
          
          console.log(`📤 [FILE UPLOAD] File ${index} URL processing (nested data):`, {
            serverUrl: fileData.url || fileData.Url,
            fileId: fileData.id,
            originalName: originalFile?.name,
            finalUrl: fileUrl
          });
          
          return {
            id: fileData.id || fileData.Id || `temp_${Date.now()}_${index}`, // Ưu tiên ID từ server
            name: originalFile?.name || fileData.name || fileData.fileName || 'Unknown',
            size: originalFile?.size || fileData.size || fileData.fileSize || 0,
            type: originalFile?.type || fileData.type || fileData.contentType || 'unknown',
            url: fileUrl,
            isServerFile: !!(fileData.id || fileData.Id) // Đánh dấu file có ID từ server
          };
        });
        
        setUploadedFiles(prev => [...prev, ...uploadedFilesData]);
        filesAdded = true;
      }
      
      if (!filesAdded) {
        // Fallback: thêm vào UI như trước nếu response không có data mong đợi
        console.log('📤 [FILE UPLOAD] Using fallback method to add files to UI');
        Array.from(files).forEach((file, index) => {
          console.log(`📤 [FILE UPLOAD] Using fallback method for file ${index}:`, file.name);
          
          const newFile: UploadedFile = {
            id: `temp_${Date.now()}_${index}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // Fallback sử dụng blob URL
            isServerFile: false // Đánh dấu là file local
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
        });
      }
      
      toast({
        title: "Thành công!",
        description: 'Upload file thành công!',
        variant: "success",
      });
    } catch (error: any) {
      console.error('❌ [FILE UPLOAD] Error uploading files:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi upload file: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      console.log('🗑️ [DELETE FILE] Starting to delete file with ID:', fileId);
      
      // Tìm file trong danh sách để kiểm tra xem có phải file từ server không
      const fileToDelete = uploadedFiles.find(f => f.id === fileId);
      const isServerFile = fileToDelete?.isServerFile || (!fileId.startsWith('temp_') && fileId.length > 10);
      
      if (isServerFile) {
        // Gọi API deleteFile chỉ khi có ID thực từ server
        const deleteResponse = await appointmentService.deleteFile(fileId);
        console.log('✅ [DELETE FILE] File deleted from server successfully:', deleteResponse);
      } else {
        console.log('📝 [DELETE FILE] File is local/temporary, skipping server delete');
      }
      
      // Cập nhật UI sau khi xóa (luôn thực hiện dù có gọi API hay không)
      setUploadedFiles(prev => {
        const fileToRemove = prev.find(f => f.id === fileId);
        if (fileToRemove?.url && !fileToRemove.url.startsWith('http')) {
          // Chỉ revoke URL nếu là blob URL (local)
          URL.revokeObjectURL(fileToRemove.url);
        }
        return prev.filter(f => f.id !== fileId);
      });
      
      toast({
        title: "Thành công!",
        description: 'Xóa file thành công!',
        variant: "success",
      });
      
    } catch (error: any) {
      console.error('❌ [DELETE FILE] Error deleting file:', error);
      
      // Vẫn xóa khỏi UI ngay cả khi API thất bại
      setUploadedFiles(prev => {
        const fileToRemove = prev.find(f => f.id === fileId);
        if (fileToRemove?.url && !fileToRemove.url.startsWith('http')) {
          // Chỉ revoke URL nếu là blob URL (local)
          URL.revokeObjectURL(fileToRemove.url);
        }
        return prev.filter(f => f.id !== fileId);
      });
      
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi xóa file từ server, nhưng đã xóa khỏi giao diện: ' + (error?.message || 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    );
  }

  if (error || !testData) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Không tìm thấy thông tin xét nghiệm'}</p>
            <Button onClick={handleCancel} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
          <Badge 
            variant={testData.status === 'COMPLETED' || testData.status === 'completed' ? 'default' : 'secondary'}
            className={
              testData.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
              testData.status === 'WAITING_FOR_CHECK_IN' ? 'bg-blue-100 text-blue-800' :
              testData.status === 'WAITING_FOR_CONFIRMATION' ? 'bg-orange-100 text-orange-800' :
              testData.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
              testData.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
              testData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              testData.status === 'IN_EXAMINATION_PROGRESS' ? 'bg-purple-100 text-purple-800' :
              testData.status === 'IN_LABORATORY' ? 'bg-purple-100 text-purple-800' :
              testData.status === 'IN_LABORATORY_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
              testData.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              testData.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              testData.status === 'completed' ? 'bg-green-100 text-green-800' :
              testData.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              testData.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              testData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              ''
            }
          >
            {testData.status === 'WAITING' ? 'Đang chờ' :
             testData.status === 'WAITING_FOR_CHECK_IN' ? 'Chờ check-in' :
             testData.status === 'WAITING_FOR_CONFIRMATION' ? 'Chờ xác nhận' :
             testData.status === 'CHECKED_IN' ? 'Đã check-in' :
             testData.status === 'PENDING' ? 'Đang chờ thanh toán' :
             testData.status === 'IN_PROGRESS' ? 'Đang xét nghiệm' :
             testData.status === 'IN_EXAMINATION_PROGRESS' ? 'Đang khám' :
             testData.status === 'IN_LABORATORY' ? 'Đang xét nghiệm' :
             testData.status === 'IN_LABORATORY_PROGRESS' ? 'Đang xét nghiệm' :
             testData.status === 'COMPLETED' ? 'Hoàn thành' :
             testData.status === 'CANCELLED' ? 'Đã hủy' :
             testData.status === 'scheduled' ? 'Đã lên lịch' :
             testData.status === 'in-progress' ? 'Đang thực hiện' :
             testData.status === 'completed' ? 'Hoàn thành' :
             testData.status === 'cancelled' ? 'Đã hủy' :
             testData.status}
          </Badge>
        </div>

        {/* Chi tiết xét nghiệm */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉ Định</h1>
          <p className="text-gray-600 mt-1">
            {testData.patientName} - {testData.testType}
          </p>
        </div>

        {/* Thông tin bệnh nhân */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Thông tin bệnh nhân</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewPatientInfo}
              className="flex items-center space-x-2"
            >
              <User size={16} />
              <span>Thông tin bệnh nhân</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên bệnh nhân</label>
                  <p className="text-lg font-semibold">{testData.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã bệnh nhân</label>
                  <p className="text-lg">{testData.patientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại xét nghiệm</label>
                  <p className="text-lg">{testData.testType}</p>
                </div>
              </div>

              {/* Right Column - Visit Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lượt khám</label>
                  <p className="text-lg">#{visitData?.queueNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng khám</label>
                  <p className="text-lg">{visitData?.examinationRoomName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bác sĩ khám</label>
                  <p className="text-lg">{visitData?.assignedDoctorName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium text-gray-500">Độ ưu tiên</label>
              <div className="mt-1">
                <Badge variant={testData.priority === 'urgent' ? 'destructive' : 'outline'}>
                  {testData.priority === 'urgent' ? 'Ưu tiên' : 'Bình thường'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dịch vụ chỉ định */}
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ chỉ định</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Danh sách dịch vụ */}
              {assignmentServices.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Danh sách dịch vụ xét nghiệm
                  </label>
                  <div className="space-y-2">
                    {assignmentServices.map((service, index) => (
                      <div key={service.serviceId || index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {service.serviceName || 'Tên dịch vụ không xác định'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Mã dịch vụ: {service.serviceId?.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-blue-600">
                            {service.price ? `${service.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa có giá'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tổng tiền */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-semibold text-gray-800">Tổng tiền:</span>
                    <span className="font-bold text-xl text-green-600">
                      {assignmentServices.reduce((total, service) => total + (service.price || 0), 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tải lên file kết quả */}
        <Card>
          <CardHeader>
            <CardTitle>Tải lên file kết quả</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Tải lên file kết quả</p>
              <p className="text-sm text-gray-500">Hỗ trợ định dạng: JPG, PNG, PDF (tối đa 10MB)</p>
            </div>

            {/* File đã tải lên */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">File đã tải lên</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      {/* File preview container */}
                      <div className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors">
                        {file.type.startsWith('image/') ? (
                          // Image preview
                          <div className="w-full h-full relative">
                            {file.url ? (
                              <div className="w-full h-full relative cursor-pointer group-hover:scale-105 transition-transform duration-200">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  onLoad={() => {
                                    console.log('✅ [IMAGE] Successfully loaded image:', file.name, file.url);
                                  }}
                                  onError={(e) => {
                                    console.error('❌ [IMAGE] Failed to load image:', file.name, file.url);
                                    // Fallback nếu không load được ảnh
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600">
                                          <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                          </svg>
                                          <span class="text-xs">Lỗi tải ảnh</span>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                                {/* Click overlay với icon */}
                                <div 
                                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
                                  onClick={() => {
                                    console.log('🖱️ [IMAGE CLICK] Opening image in new tab:', file.name, file.url);
                                    if (file.url) {
                                      window.open(file.url, '_blank', 'noopener,noreferrer');
                                    } else {
                                      console.warn('⚠️ [IMAGE CLICK] No URL available for file:', file.name);
                                    }
                                  }}
                                >
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-white rounded-full p-3 shadow-lg">
                                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Không có URL
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-xs">Không có URL</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Non-image file preview
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                            {file.type.includes('pdf') ? (
                              <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                            ) : (
                              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            )}
                            <span className="text-xs text-gray-500 font-medium">
                              {file.type.includes('pdf') ? 'PDF' : 'FILE'}
                            </span>
                            {/* Click overlay for non-images */}
                            {file.url && file.isServerFile && (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200"
                              />
                            )}
                          </div>
                        )}
                      </div>



                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input file ẩn để upload */}
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Ghi chú */}
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
          <Button
            onClick={handleCompleteTest}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Hoàn Thành Xét Nghiệm
          </Button>
        </div>

        {/* Patient Info Modal */}
        {showPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Hồ sơ bệnh nhân</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPatientModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingPatient ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
                  </div>
                ) : patientDetails ? (
                  <div className="space-y-8">
                    {/* Basic Info - 2 columns */}
                    <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Họ và tên</label>
                          <p className="text-lg font-medium text-gray-900">{patientDetails.name}</p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Số điện thoại</label>
                          <p className="text-lg text-gray-900">{patientDetails.phoneNumber || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Ngày sinh</label>
                          <p className="text-lg text-gray-900">
                            {patientDetails.dateOfBirth ? new Date(patientDetails.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">CCCD/CMND</label>
                          <p className="text-lg text-gray-900">{patientDetails.citizenId || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Email</label>
                          <p className="text-lg text-gray-900">{patientDetails.email || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Giới tính</label>
                          <p className="text-lg text-gray-900">
                            {patientDetails.gender === 'MALE' ? 'Nam' : 
                             patientDetails.gender === 'FEMALE' ? 'Nữ' : 
                             patientDetails.gender || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="border-t pt-6">
                      <div className="flex items-center mb-4">
                        <FileText className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h3>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Địa chỉ</label>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-900">{patientDetails.address || 'Chưa có thông tin địa chỉ'}</p>
                        </div>
                      </div>
                    </div>

                    {/* System Info Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h3>
                      
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">ID hồ sơ</label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-mono text-gray-700">{patientDetails.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Không thể tải thông tin bệnh nhân</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t bg-gray-50">
                <Button
                  onClick={() => setShowPatientModal(false)}
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

export default TestDetail;
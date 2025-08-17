import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, ChevronDown, Trash2, X } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { appointmentService, Appointment, ServiceResponseDTO, AssignmentRequestDTO } from '@/shared/services/appointmentService';
import { adminService } from '@/shared/services/adminService';
import { useToast } from '@/shared/components/ui/use-toast';

const CreateExaminationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const visitData = location.state?.visit; // Nhận dữ liệu visit từ navigation
  const { toast } = useToast();

  const [diagnosis, setDiagnosis] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [examinations, setExaminations] = useState<Array<{
    id: string;
    room: string;
    roomId: string;
    services: Array<{ id: string; label: string; price?: number }>;
    order: number;
    status: string;
  }>>([]);
  const [assignmentsCreated, setAssignmentsCreated] = useState(false);
  const [creatingAssignments, setCreatingAssignments] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  
  // Medical record modal states
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [medicalRecordData, setMedicalRecordData] = useState<any>(null);
  const [examinationHistory, setExaminationHistory] = useState<any[]>([]);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);
  const [loadingExaminationHistory, setLoadingExaminationHistory] = useState(false);
  
  // API data states
  const [laboratoryRooms, setLaboratoryRooms] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceResponseDTO[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  
  // Medicine states
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  
  // Examination result states
  const [examinationResultId, setExaminationResultId] = useState<string | null>(null);
  const [savingExamination, setSavingExamination] = useState(false);
  const [completingVisit, setCompletingVisit] = useState(false);
  const [loadingExaminationResult, setLoadingExaminationResult] = useState(false);
  const [isVisitCompleted, setIsVisitCompleted] = useState(false);
  
  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // Reschedule form states
  const [rescheduleFormData, setRescheduleFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    address: '',
    symptoms: '',
    date: '',
    timeSlotId: '',
    requiredDoctorId: ''
  });
  
  // Kiểm tra nếu visit đã hoàn thành từ trước
  useEffect(() => {
    if (visitData?.status === 'COMPLETED') {
      setIsVisitCompleted(true);
    }
  }, [visitData?.status]);
  
  // Modal kết quả xét nghiệm
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [laboratoryResult, setLaboratoryResult] = useState<any>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  
  // Dropdown state
  const [selectedOption, setSelectedOption] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
  
  // Prescription states
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [savingPrescription, setSavingPrescription] = useState(false);

  // Lọc ra các phòng chưa được sử dụng
  const usedRoomIds = examinations.map(exam => exam.roomId);
  const availableRooms = laboratoryRooms.filter(room => !usedRoomIds.includes(room.id));

  // Fetch assignments by visitId
  const fetchAssignments = useCallback(async () => {
    if (!visitData?.visitId) {
      console.log('No visitId available');
      return;
    }

    setLoadingAssignments(true);
    try {
      const response = await appointmentService.getAssignmentByVisitId(visitData.visitId);
      console.log('Assignments response:', response);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [Array(1)] }
      // Trong đó data[0] chứa array các assignments
      if (response && response.data && Array.isArray(response.data)) {
        // Kiểm tra nếu data[0] là array chứa assignments
        if (response.data[0] && Array.isArray(response.data[0])) {
          setAssignmentData(response.data[0]);
        } else {
          // Fallback: nếu data trực tiếp là array assignments
          setAssignmentData(response.data);
        }
      } else {
        setAssignmentData([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignmentData([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [visitData?.visitId]);

  // Fetch kết quả xét nghiệm theo assignmentId
  const fetchLaboratoryResult = async (assignmentId: string) => {
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
        title: "Lỗi!",
        description: 'Không thể tải kết quả xét nghiệm. Vui lòng thử lại sau.',
        variant: "destructive",
      });
    } finally {
      setLoadingResult(false);
    }
  };

  // Fetch medicines
  const fetchMedicines = useCallback(async () => {
    setLoadingMedicines(true);
    try {
      const response = await appointmentService.getActiveMedicines();
      console.log('Active medicines response:', response);
      
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        setMedicines(response.data);
      }
    } catch (error) {
      console.error('Error fetching active medicines:', error);
      toast({
        title: "Lỗi!",
        description: 'Không thể tải danh sách thuốc. Vui lòng thử lại sau.',
        variant: "destructive",
      });
    } finally {
      setLoadingMedicines(false);
    }
  }, [toast]);

  // Fetch examination result để load lại dữ liệu đã lưu
  const fetchExaminationResult = useCallback(async () => {
    if (!visitData?.visitId) {
      console.log('No visitId available for fetching examination result');
      return;
    }

    setLoadingExaminationResult(true);
    try {
      console.log('Fetching examination result for visit:', visitData.visitId);
      const response = await appointmentService.getExaminationResultByVisitId(visitData.visitId);
      
      if (response && response.data && Array.isArray(response.data) && response.data[0]) {
        const examinationResult = response.data[0];
        console.log('Found existing examination result:', examinationResult);
        
        // Set dữ liệu vào form
        if (examinationResult.summary) {
          setDiagnosis(examinationResult.summary);
        }
        if (examinationResult.conclusion) {
          setConclusion(examinationResult.conclusion);
        }
        
        // Lưu ID để dùng cho update
        setExaminationResultId(examinationResult.id);
        
        // Fetch prescription nếu có
        if (examinationResult.id) {
          try {
            const prescriptionResponse = await appointmentService.getPrescriptionByExaminationResultId(examinationResult.id);
            
            // Kiểm tra nhiều cấu trúc dữ liệu có thể
            let prescription = null;
            
            if (prescriptionResponse && prescriptionResponse.data) {
              if (Array.isArray(prescriptionResponse.data) && prescriptionResponse.data[0]) {
                prescription = prescriptionResponse.data[0];
              } else if (prescriptionResponse.data.id) {
                // Trường hợp data là object trực tiếp
                prescription = prescriptionResponse.data;
              }
            }
            
            if (prescription) {
              
              setPrescriptionId(prescription.id);
              
              // Load prescription items - kiểm tra cả prescriptionItems và items
              let prescriptionItemsArray = [];
              
              if (prescription.prescriptionItems && Array.isArray(prescription.prescriptionItems)) {
                prescriptionItemsArray = prescription.prescriptionItems;
              } else if (prescription.items && Array.isArray(prescription.items)) {
                prescriptionItemsArray = prescription.items;
              }
              
              if (prescriptionItemsArray.length > 0) {
                const items = prescriptionItemsArray.map((item: any, index: number) => ({
                  id: item.id || `${Date.now()}-${index}`,
                  medicineId: item.medicineId,
                  medicineName: item.medicine?.name || item.medicineName || 'Thuốc không xác định',
                  dosage: item.dosage,
                  frequency: item.frequency,
                  duration: item.duration,
                  instructions: item.instructions || '',
                  medicine: item.medicine || { 
                    name: item.medicine?.name || item.medicineName || 'Thuốc không xác định',
                    description: item.medicine?.description || '',
                    packaging: item.medicine?.packaging || '',
                    strength: item.medicine?.strength || '',
                    unit: item.medicine?.unit || ''
                  }
                }));
                setPrescriptionItems(items);
              }
            }
          } catch (prescriptionError) {
            // Không có prescription hoặc có lỗi khi fetch
          }
        }
      } else {
        console.log('No existing examination result found');
      }
    } catch (error) {
      console.log('No existing examination result found or error:', error);
    } finally {
      setLoadingExaminationResult(false);
    }
  }, [visitData?.visitId]);

  // Fetch laboratory rooms khi component mount
  useEffect(() => {
    const fetchLaboratoryRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await appointmentService.getLaboratoryRooms();
        console.log('Laboratory rooms response:', response);
        
        // API trả về: { statusCode: 200, success: true, message: "...", data: [{ paginatedResponse }] }
        if (response && response.data && Array.isArray(response.data) && response.data[0]) {
          const paginatedData = response.data[0];
          if (paginatedData.items && Array.isArray(paginatedData.items)) {
            setLaboratoryRooms(paginatedData.items);
          }
        }
      } catch (error) {
        console.error('Error fetching laboratory rooms:', error);
        toast({
          title: "Lỗi!",
          description: 'Không thể tải danh sách phòng xét nghiệm. Vui lòng thử lại sau.',
          variant: "destructive",
        });
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchLaboratoryRooms();
    fetchAssignments(); // Fetch assignments khi component mount
    fetchMedicines(); // Fetch medicines khi component mount
    fetchExaminationResult(); // Fetch examination result để load lại dữ liệu đã lưu
    
    // Fetch time slots
    const fetchTimeSlots = async () => {
      try {
        const response = await appointmentService.getTimeSlots();
        setTimeSlots(response);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };
    fetchTimeSlots();
  }, [fetchAssignments, fetchMedicines, fetchExaminationResult, toast]);

  // Filter medicines based on search text and exclude medicines already in prescription
  useEffect(() => {
    // Get IDs of medicines already added to prescription
    const addedMedicineIds = prescriptionItems.map(item => item.medicineId);
    
    // Filter out medicines that are already in the prescription
    const availableMedicines = medicines.filter(medicine => 
      !addedMedicineIds.includes(medicine.id)
    );
    
    if (!searchText.trim()) {
      setFilteredMedicines(availableMedicines);
    } else {
      const filtered = availableMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (medicine.description && medicine.description.toLowerCase().includes(searchText.toLowerCase())) ||
        (medicine.activeIngredients && medicine.activeIngredients.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredMedicines(filtered);
    }
  }, [searchText, medicines, prescriptionItems]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.medicine-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch services khi chọn phòng
  const fetchServicesForRoom = useCallback(async (roomId: string) => {
    if (!roomId) {
      setAvailableServices([]);
      return;
    }

    setLoadingServices(true);
    try {
      const services = await appointmentService.getServices(roomId);
      console.log('Services response:', services);
      
      // API trả về array of ServiceResponseDTO
      if (services && Array.isArray(services)) {
        setAvailableServices(services);
      } else {
        setAvailableServices([]);
      }
    } catch (error) {
      console.error('Error fetching services for room:', error);
      setAvailableServices([]);
      toast({
        title: "Lỗi!",
        description: 'Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.',
        variant: "destructive",
      });
    } finally {
      setLoadingServices(false);
    }
  }, [toast]);

  // Reset dịch vụ và fetch services khi thay đổi phòng
  useEffect(() => {
    setSelectedServices([]);
    if (selectedRoomId) {
      fetchServicesForRoom(selectedRoomId);
    } else {
      setAvailableServices([]);
    }
  }, [selectedRoomId, fetchServicesForRoom]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddExamination = () => {
    if (!selectedRoom || !selectedRoomId || selectedServices.length === 0) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng chọn phòng và ít nhất một dịch vụ',
        variant: "destructive",
      });
      return;
    }

    const selectedServiceObjects = availableServices
      .filter(service => selectedServices.includes(service.id))
      .map(service => ({
        id: service.id,
        label: service.name,
        price: service.price
      }));

    const newExamination = {
      id: Date.now().toString(),
      room: selectedRoom,
      roomId: selectedRoomId,
      services: selectedServiceObjects,
      order: examinations.length + 1,
      status: 'PENDING' // Trạng thái ban đầu
    };

    setExaminations(prev => [...prev, newExamination]);
    
    // Reset form
    setSelectedRoom('');
    setSelectedRoomId('');
    setSelectedServices([]);
    setIsRoomDropdownOpen(false);
  };



  const handleDeleteExamination = (examinationId: string) => {
    setExaminations(prev => {
      const filtered = prev.filter(exam => exam.id !== examinationId);
      // Cập nhật lại thứ tự
      return filtered.map((exam, index) => ({
        ...exam,
        order: index + 1
      }));
    });
  };

  const handleCompleteExaminations = async () => {
    if (examinations.length === 0) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng thêm ít nhất một chỉ định',
        variant: "destructive",
      });
      return;
    }
    
    setCreatingAssignments(true);
    try {
      // Tạo assignments cho visit
      const assignments: AssignmentRequestDTO[] = examinations.map((examination) => ({
        laboratoryRoomId: examination.roomId,
        serviceIds: examination.services.map(service => service.id)
      }));
      
      if (visitData?.visitId) {
        await appointmentService.createAssignment(visitData.visitId, assignments);
        setAssignmentsCreated(true);
        toast({
          title: "Thành công!",
          description: 'Tạo chỉ định thành công!',
          variant: "success",
        });
        
        // Refresh lại danh sách assignments
        await fetchAssignments();
        
        // Giữ nguyên trạng thái examinations, không force update
        // Trạng thái thực tế sẽ được cập nhật từ API response
      } else {
        throw new Error('Không tìm thấy visitId');
      }
      
    } catch (error) {
      console.error('Error creating assignments:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi tạo chỉ định. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setCreatingAssignments(false);
    }
  };

  const handleSave = async () => {
    // Validation nghiêm ngặt hơn
    if (!diagnosis.trim() && !conclusion.trim()) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng nhập chẩn đoán hoặc kết luận',
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra độ dài tối thiểu
    if (diagnosis.trim().length < 3 && conclusion.trim().length < 3) {
      toast({
        title: "Lỗi!",
        description: 'Chẩn đoán hoặc kết luận phải có ít nhất 3 ký tự',
        variant: "destructive",
      });
      return;
    }

    setSavingExamination(true);
    try {
      if (!visitData?.visitId) {
        throw new Error('Không tìm thấy visitId');
      }

      // Chuẩn bị dữ liệu - API mong đợi summary và conclusion
      const examinationData = {
        summary: diagnosis.trim(),
        conclusion: conclusion.trim(),
      };
      
      console.log('Examination data to save:', examinationData);

      // Kiểm tra xem đã có examination result cho visit này chưa
      let existingResult = null;
      try {
        console.log('Checking existing examination result for visit:', visitData.visitId);
        const checkResponse = await appointmentService.getExaminationResultByVisitId(visitData.visitId);
        if (checkResponse && checkResponse.data && Array.isArray(checkResponse.data) && checkResponse.data[0]) {
          existingResult = checkResponse.data[0];
          console.log('Found existing examination result:', existingResult);
        }
      } catch (checkError) {
        console.log('No existing examination result found, will create new one');
      }

      if (existingResult && existingResult.id) {
        // Cập nhật examination result đã có
        console.log('Updating existing examination result:', existingResult.id);
        setExaminationResultId(existingResult.id);
        
        await appointmentService.updateExaminationResult(existingResult.id, examinationData);
        toast({
          title: "Thành công!",
          description: 'Cập nhật phiếu khám thành công!',
          variant: "success",
        });
      } else {
        // Tạo mới examination result
        console.log('Creating new examination result for visit:', visitData.visitId);
        
        const createResponse = await appointmentService.createExaminationResult(visitData.visitId, examinationData);
        
        console.log('Create examination result response:', createResponse);
        
        // Lấy ID từ response để dùng cho update sau này
        if (createResponse && createResponse.data && Array.isArray(createResponse.data) && createResponse.data[0]) {
          setExaminationResultId(createResponse.data[0].id);
        }
        
        toast({
          title: "Thành công!",
          description: 'Lưu phiếu khám thành công!',
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error('Error saving examination:', error);
      console.error('Error details:', error?.response?.data);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi lưu phiếu khám';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Thử nhiều cách để lấy error message
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.errors) {
          if (typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (typeof errorData.errors === 'object') {
            const validationErrors = Object.values(errorData.errors).flat();
            errorMessage = validationErrors.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi!",
        description: `Lỗi: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSavingExamination(false);
    }
  };

  // Prescription handlers
  const handleAddMedicineToList = () => {
    if (!selectedMedicine || !dosage.trim() || !frequency.trim() || !duration.trim()) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng chọn thuốc và nhập đầy đủ thông tin',
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim(),
      medicine: selectedMedicine // Lưu thông tin thuốc để hiển thị
    };

    setPrescriptionItems(prev => [...prev, newItem]);
    
    // Reset form
    setSelectedMedicine(null);
    setSelectedOption('');
    setSearchText('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
  };

  const handleRemoveMedicineFromList = (itemId: string) => {
    setPrescriptionItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSavePrescription = async () => {
    if (prescriptionItems.length === 0) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng thêm ít nhất một thuốc vào đơn',
        variant: "destructive",
      });
      return;
    }

    if (!examinationResultId) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng lưu phiếu khám trước khi tạo đơn thuốc',
        variant: "destructive",
      });
      return;
    }

    setSavingPrescription(true);
    try {
      const prescriptionData = {
        note: '', // Có thể thêm ghi chú nếu cần
        items: prescriptionItems.map(item => ({
          medicineId: item.medicineId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions
        }))
      };

      if (prescriptionId) {
        // Cập nhật đơn thuốc đã có
        await appointmentService.updatePrescription(prescriptionId, prescriptionData);
        toast({
          title: "Thành công!",
          description: 'Cập nhật đơn thuốc thành công!',
          variant: "success",
        });
      } else {
        // Tạo đơn thuốc mới
        const response = await appointmentService.createPrescription(examinationResultId, prescriptionData);
        
        // Lấy ID từ response
        if (response && response.data && Array.isArray(response.data) && response.data[0]) {
          setPrescriptionId(response.data[0].id);
        }
        
        toast({
          title: "Thành công!",
          description: 'Tạo đơn thuốc thành công!',
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi lưu đơn thuốc. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!prescriptionId) {
      // Chỉ xóa local state nếu chưa save
      setPrescriptionItems([]);
      return;
    }

    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ đơn thuốc?');
    if (!confirmDelete) return;

    try {
      await appointmentService.deletePrescription(prescriptionId);
      setPrescriptionItems([]);
      setPrescriptionId(null);
      toast({
        title: "Thành công!",
        description: 'Xóa đơn thuốc thành công!',
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi xóa đơn thuốc. Vui lòng thử lại.',
        variant: "destructive",
      });
    }
  };

  const handleCreatePrescription = () => {
    // Scroll to prescription section
    const prescriptionSection = document.querySelector('.prescription-section');
    if (prescriptionSection) {
      prescriptionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!visitData?.visitId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin visit để hoàn thành',
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra xem đã lưu phiếu khám chưa
    if (!diagnosis.trim() && !conclusion.trim()) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng lưu phiếu khám trước khi hoàn thành',
        variant: "destructive",
      });
      return;
    }

    // Hiển thị modal xác nhận thay vì alert
    setShowCompleteModal(true);
  };

  // Helper function để format date cho input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Nếu dateString đã là format YYYY-MM-DD
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        return dateString;
      }
      
      // Nếu là format DD/MM/YYYY
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Nếu là Date object hoặc ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleCompleteAndSchedule = async () => {
    if (!visitData?.visitId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin visit để hoàn thành',
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra xem đã lưu phiếu khám chưa
    if (!diagnosis.trim() && !conclusion.trim()) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng lưu phiếu khám trước khi hoàn thành',
        variant: "destructive",
      });
      return;
    }

    // Tự động điền thông tin bệnh nhân từ appointment data
    if (appointmentData) {
      console.log('Using existing appointmentData:', appointmentData);
      console.log('Original dateOfBirth:', appointmentData.dateOfBirth);
      console.log('Formatted birthdate:', formatDateForInput(appointmentData.dateOfBirth || ''));
      
      setRescheduleFormData({
        name: appointmentData.name || '',
        email: appointmentData.email || '',
        phone: appointmentData.phoneNumber || '',
        birthdate: formatDateForInput(appointmentData.dateOfBirth || ''),
        gender: appointmentData.gender === 'Nam' ? 'male' : appointmentData.gender === 'Nữ' ? 'female' : '',
        address: appointmentData.address || '',
        symptoms: '', // Để trống để bác sĩ điền
        date: '', // Để trống để bác sĩ chọn
        timeSlotId: '', // Để trống để bác sĩ chọn
        requiredDoctorId: appointmentData.requiredDoctorId || ''
      });
    } else if (visitData?.appointmentId) {
      // Nếu chưa có appointment data nhưng có appointmentId, fetch data
      try {
        const appointment = await appointmentService.getAppointmentById(visitData.appointmentId);
        setAppointmentData(appointment);
        
        setRescheduleFormData({
          name: appointment.name || '',
          email: appointment.email || '',
          phone: appointment.phoneNumber || '',
          birthdate: formatDateForInput(appointment.dateOfBirth || ''),
          gender: appointment.gender === 'Nam' ? 'male' : appointment.gender === 'Nữ' ? 'female' : '',
          address: appointment.address || '',
          symptoms: '', // Để trống để bác sĩ điền
          date: '', // Để trống để bác sĩ chọn
          timeSlotId: '', // Để trống để bác sĩ chọn
          requiredDoctorId: appointment.requiredDoctorId || ''
        });
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        // Fallback: sử dụng thông tin từ visitData
        setRescheduleFormData({
          name: visitData.patientName || '',
          email: '',
          phone: '',
          birthdate: '',
          gender: '',
          address: '',
          symptoms: '',
          date: '',
          timeSlotId: '',
          requiredDoctorId: ''
        });
      }
    } else {
      // Fallback: sử dụng thông tin từ visitData
      setRescheduleFormData({
        name: visitData.patientName || '',
        email: '',
        phone: '',
        birthdate: '',
        gender: '',
        address: '',
        symptoms: '',
        date: '',
        timeSlotId: '',
        requiredDoctorId: ''
      });
    }

    // Hiển thị modal đặt lịch tái khám
    setShowRescheduleModal(true);
  };

  const handleRescheduleInputChange = (field: string, value: string) => {
    setRescheduleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validation cho form đặt lịch tái khám
  const validateRescheduleForm = (): boolean => {
    const requiredFields = [
      'name', 'email', 'phone', 'birthdate', 'gender', 'date', 'timeSlotId'
    ];
    
    for (const field of requiredFields) {
      if (!rescheduleFormData[field] || rescheduleFormData[field].trim() === '') {
        return false;
      }
    }
    
    return true;
  };

  const handleConfirmReschedule = async () => {
    // Validation trước khi submit
    if (!validateRescheduleForm()) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng điền đầy đủ các trường bắt buộc',
        variant: "destructive",
      });
      return;
    }

    setIsRescheduling(true);
    try {
      // Chuẩn bị data cho API tạo lịch hẹn
      const appointmentData = {
        name: rescheduleFormData.name,
        phoneNumber: rescheduleFormData.phone,
        email: rescheduleFormData.email,
        dateOfBirth: rescheduleFormData.birthdate,
        gender: rescheduleFormData.gender === 'male' ? 'Nam' : 'Nữ',
        address: rescheduleFormData.address,
        symptom: rescheduleFormData.symptoms,
        requiredDoctorId: rescheduleFormData.requiredDoctorId || "",
        date: rescheduleFormData.date,
        timeSlotId: rescheduleFormData.timeSlotId
      };

      // Gọi song song 2 API
      const [markCompletedResult, createAppointmentResult] = await Promise.all([
        appointmentService.markAsCompleted(visitData.visitId),
        appointmentService.createAppointment(appointmentData)
      ]);
      
      console.log('Mark completed result:', markCompletedResult);
      console.log('Create appointment result:', createAppointmentResult);
      
      toast({
        title: "Thành công!",
        description: 'Hoàn thành khám bệnh và đặt lịch tái khám thành công!',
        variant: "success",
      });
      
      // Set state để ẩn tất cả button
      setIsVisitCompleted(true);
      
      // Đóng modal
      setShowRescheduleModal(false);
      
    } catch (error) {
      console.error('Error completing visit and scheduling:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi hoàn thành khám bệnh và đặt lịch tái khám. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelReschedule = () => {
    setShowRescheduleModal(false);
  };

  const handleConfirmComplete = async () => {
    setCompletingVisit(true);
    try {
      console.log('Completing visit:', visitData.visitId);
      await appointmentService.markAsCompleted(visitData.visitId);
      
      toast({
        title: "Thành công!",
        description: 'Hoàn thành khám bệnh thành công!',
        variant: "success",
      });
      
      // Set state để ẩn tất cả button
      setIsVisitCompleted(true);
      
      // Đóng modal
      setShowCompleteModal(false);
      
      // Không navigate ngay lập tức, để user thấy các button đã ẩn
      // User có thể tự navigate về trang trước
    } catch (error) {
      console.error('Error completing visit:', error);
      toast({
        title: "Lỗi!",
        description: 'Có lỗi xảy ra khi hoàn thành khám bệnh. Vui lòng thử lại.',
        variant: "destructive",
      });
    } finally {
      setCompletingVisit(false);
    }
  };

  const handleCancelComplete = () => {
    setShowCompleteModal(false);
  };

  const handleViewAppointmentInfo = async () => {
    setShowAppointmentModal(true);
    
    // Gọi API để lấy thông tin appointment nếu có appointmentId
    if (visitData?.appointmentId && !appointmentData) {
      setLoadingAppointment(true);
      try {
        console.log('Fetching appointment with ID:', visitData.appointmentId);
        const appointment = await appointmentService.getAppointmentById(visitData.appointmentId);
        console.log('Appointment data received:', appointment);
        setAppointmentData(appointment);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast({
          title: "Lỗi!",
          description: 'Không thể tải thông tin lịch khám. Vui lòng thử lại sau.',
          variant: "destructive",
        });
      } finally {
        setLoadingAppointment(false);
      }
    }
  };

  const handleViewPatientRecord = async () => {
    setShowPatientModal(true);
    
    // Gọi API để lấy thông tin bệnh nhân nếu có patientProfileId
    if (visitData?.patientProfileId && !patientData) {
      setLoadingPatient(true);
      try {
        console.log('Fetching patient with ID:', visitData.patientProfileId);
        const patient = await adminService.getPatientById(visitData.patientProfileId);
        console.log('Patient data received:', patient);
        setPatientData(patient);
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast({
          title: "Lỗi!",
          description: 'Không thể tải thông tin hồ sơ bệnh nhân. Vui lòng thử lại sau.',
          variant: "destructive",
        });
      } finally {
        setLoadingPatient(false);
      }
    }
  };

  const handleViewMedicalRecord = async () => {
    if (!visitData?.patientProfileId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin bệnh nhân.',
        variant: "destructive",
      });
      return;
    }

    setShowMedicalRecordModal(true);
    setLoadingMedicalRecord(true);
    setLoadingExaminationHistory(true);

    try {
      // Fetch medical record
      console.log('Fetching medical record for patient:', visitData.patientProfileId);
      const medicalRecordResponse = await appointmentService.getMedicalRecordByPatientProfile(visitData.patientProfileId);
      
      if (medicalRecordResponse && medicalRecordResponse.data && Array.isArray(medicalRecordResponse.data) && medicalRecordResponse.data.length > 0) {
        const record = medicalRecordResponse.data[0];
        setMedicalRecordData(record);
        console.log('Medical record received:', record);

        // Fetch examination history using medical record ID
        if (record.medicalRecordId) {
          try {
            console.log('Fetching examination history for medical record:', record.medicalRecordId);
            const historyResponse = await appointmentService.getExaminationResultByMedicalRecord(record.medicalRecordId);
            
            if (historyResponse && historyResponse.success && historyResponse.data) {
              setExaminationHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
              console.log('Examination history received:', historyResponse.data);
            } else {
              setExaminationHistory([]);
            }
          } catch (historyError) {
            console.error('Error fetching examination history:', historyError);
            setExaminationHistory([]);
            toast({
              title: "Cảnh báo!",
              description: 'Không thể tải lịch sử khám bệnh.',
              variant: "destructive",
            });
          }
        }
      } else {
        setMedicalRecordData(null);
        setExaminationHistory([]);
        toast({
          title: "Thông báo!",
          description: 'Không tìm thấy hồ sơ bệnh án cho bệnh nhân này.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
      setMedicalRecordData(null);
      setExaminationHistory([]);
      toast({
        title: "Lỗi!",
        description: 'Không thể tải hồ sơ bệnh án. Vui lòng thử lại sau.',
        variant: "destructive",
      });
    } finally {
      setLoadingMedicalRecord(false);
      setLoadingExaminationHistory(false);
    }
  };

  const handleViewAssignmentDetail = async (assignment: any) => {
    // Chỉ cho phép xem chi tiết khi trạng thái là COMPLETED
    if (assignment.status !== 'COMPLETED') {
      return;
    }

    setSelectedAssignment(assignment);
    setShowResultModal(true);
    
    // Fetch kết quả xét nghiệm
    if (assignment.assignmentId) {
      await fetchLaboratoryResult(assignment.assignmentId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return "bg-green-100 text-green-800";
      case "WAITING_FOR_CHECK_IN":
        return "bg-blue-100 text-blue-800";
      case "WAITING_FOR_CONFIRMATION":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "IN_EXAMINATION_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return "Đã check-in";
      case "WAITING_FOR_CHECK_IN":
        return "Chờ check-in";
      case "WAITING_FOR_CONFIRMATION":
        return "Chờ xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "IN_EXAMINATION_PROGRESS":
        return "Đang khám";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getExaminationStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "WAITING":
        return "bg-purple-100 text-purple-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExaminationStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ thanh toán";
      case "WAITING":
        return "Đang xét nghiệm";
      case "ASSIGNED":
        return "Đã chỉ định";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Format date function
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
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy">
           Phiếu Khám
          </h1>
          {visitData && (
            <p className="text-gray-600 mt-1">
              Bệnh nhân: {visitData.patientName} - Số thứ tự: {visitData.queueNumber}
            </p>
          )}
        </div>
      </div>

      {/* Main Form */}
      <Card className="p-6">
        {/* Action Buttons - Top Right */}
        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={handleViewAppointmentInfo}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium"
          >
            <Calendar size={16} />
            <span>Xem thông tin lịch khám</span>
          </button>
          <button
            onClick={handleViewPatientRecord}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 font-medium"
          >
            <User size={16} />
            <span>Xem hồ sơ bệnh nhân</span>
          </button>
        </div>

        {/* Chỉ Định Xét Nghiệm */}
        {!isVisitCompleted && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chỉ Định Xét Nghiệm
            </h3>

          {/* Chọn phòng xét nghiệm - Ẩn sau khi hoàn thành */}
          {!assignmentsCreated && !isVisitCompleted && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn phòng xét nghiệm
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={loadingRooms || availableRooms.length === 0}
                  >
                    <span className={selectedRoom ? 'text-gray-900' : 'text-gray-500'}>
                      {loadingRooms ? 'Đang tải...' : (selectedRoom || 'Chọn phòng')}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isRoomDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isRoomDropdownOpen && !loadingRooms && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {availableRooms.length > 0 ? (
                        availableRooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => {
                              setSelectedRoom(room.name);
                              setSelectedRoomId(room.id);
                              setIsRoomDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <div className="font-medium">{room.name}</div>
                              {room.description && (
                                <div className="text-sm text-gray-500">{room.description}</div>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          Tất cả phòng đã được chỉ định
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chọn dịch vụ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn dịch vụ
            </label>
            {selectedRoom ? (
              loadingServices ? (
                <div className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang tải dịch vụ...</span>
                  </div>
                </div>
              ) : availableServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {availableServices.map((service) => (
                    <label key={service.id} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                        )}
                        {service.price && (
                          <div className="text-sm text-blue-600 font-medium mt-1">
                            {service.price.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                  Không có dịch vụ nào cho phòng này
                </div>
              )
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                Vui lòng chọn phòng xét nghiệm trước
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!assignmentsCreated && !isVisitCompleted && (
              <button 
                onClick={handleAddExamination}
                disabled={!selectedRoom || !selectedRoomId || selectedServices.length === 0 || loadingServices}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span>Thêm Chỉ Định</span>
              </button>
            )}
            {!isVisitCompleted && (
              <button 
                onClick={handleCompleteExaminations}
                disabled={examinations.length === 0 || creatingAssignments || assignmentsCreated}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
              {creatingAssignments ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang tạo chỉ định...</span>
                </>
              ) : assignmentsCreated ? (
                <span>Đã hoàn thành</span>
              ) : (
                <span>Hoàn thành tạo chỉ định</span>
              )}
            </button>
            )}
          </div>
            </>
          )}
        </div>
        )}

        {/* Danh Sách Chỉ Định */}
        {examinations.length > 0 && !isVisitCompleted && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Danh Sách Chỉ Định (Thứ tự thực hiện)
            </h3>
            <div className="space-y-4">
              {examinations.map((examination) => (
                <div key={examination.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          #{examination.order} - {examination.room}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getExaminationStatusColor(examination.status)}`}>
                          {getExaminationStatusText(examination.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Dịch vụ: </span>
                        {examination.services.map(service => service.label).join(', ')}
                      </div>
                      {examination.services.some(service => service.price) && (
                        <div className="text-sm text-blue-600 font-medium mt-1">
                          <span className="font-medium">Giá: </span>
                          {examination.services
                            .filter(service => service.price)
                            .map(service => `${service.price?.toLocaleString('vi-VN')} VNĐ`)
                            .join(', ')
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex items-center ml-4">
                      {!assignmentsCreated && !isVisitCompleted && (
                        <button
                          onClick={() => handleDeleteExamination(examination.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bảng phòng chỉ định */}
        <div className="mb-8">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Giá tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingAssignments ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Đang tải danh sách chỉ định...</span>
                      </div>
                    </td>
                  </tr>
                ) : assignmentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Chưa có chỉ định nào cho visit này
                    </td>
                  </tr>
                ) : (
                  assignmentData.map((assignment, index) => (
                    <tr key={assignment.assignmentId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.laboratoryRoomName || 'Chưa có tên phòng'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {assignment.laboratoryRoomId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExaminationStatusColor(assignment.status || 'PENDING')}`}>
                          {getExaminationStatusText(assignment.status || 'PENDING')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.assignmentServices && assignment.assignmentServices.length > 0 
                            ? assignment.assignmentServices.map((service: any) => service.serviceName).join(', ')
                            : 'Chưa có dịch vụ'
                          }
                        </div>
                        {assignment.assignmentServices && assignment.assignmentServices.length > 1 && (
                          <div className="text-sm text-gray-500">
                            {assignment.assignmentServices.length} dịch vụ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignment.assignmentServices && assignment.assignmentServices.length > 0 ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.assignmentServices
                                .filter((service: any) => service.price)
                                .map((service: any) => `${service.price?.toLocaleString('vi-VN')} VNĐ`)
                                .join(', ') || 'Chưa có giá'}
                            </div>
                            {assignment.totalPrice && (
                              <div className="text-sm text-blue-600 font-medium">
                                Tổng: {assignment.totalPrice.toLocaleString('vi-VN')} VNĐ
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Chưa có giá</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className={`${
                            assignment.status === 'COMPLETED' 
                              ? 'text-blue-600 hover:text-blue-900 cursor-pointer' 
                              : 'text-gray-400 cursor-not-allowed'
                          } transition-colors`}
                          onClick={() => handleViewAssignmentDetail(assignment)}
                          disabled={assignment.status !== 'COMPLETED'}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chẩn đoán sơ bộ */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chẩn đoán sơ bộ
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder={loadingExaminationResult ? "Đang tải dữ liệu..." : "Chẩn đoán sơ bộ..."}
            disabled={loadingExaminationResult}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Kết luận */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kết luận
          </label>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder={loadingExaminationResult ? "Đang tải dữ liệu..." : "Kết luận khám bệnh..."}
            disabled={loadingExaminationResult}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {/* Nút Lưu ngay dưới góc phải của ô Kết luận */}
          {!isVisitCompleted && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                disabled={savingExamination}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
              {savingExamination ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang lưu...</span>
                </div>
              ) : (
                'Lưu phiếu khám'
              )}
            </button>
          </div>
          )}
        </div>

        {/* Dropdown List dưới dòng kẻ */}
        <div className="mt-8 pt-6 border-t border-gray-200 prescription-section">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại thuốc
            </label>
            <div className="relative medicine-dropdown">
              <div className="flex">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={selectedOption || 'Nhập tên thuốc hoặc chọn từ danh sách...'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {loadingMedicines ? (
                    <div className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-sm text-gray-500">Đang tải thuốc...</span>
                      </div>
                    </div>
                  ) : filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        onClick={() => {
                          setSelectedOption(medicine.name);
                          setSearchText(medicine.name);
                          setSelectedMedicine(medicine);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          {/* Hiển thị description, packaging, strength, unit trên cùng một hàng */}
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                            {medicine.description && (
                              <span className="text-gray-500 text-sm">
                                {medicine.description}
                              </span>
                            )}
                            {medicine.packaging && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {medicine.packaging}
                              </span>
                            )}
                            {medicine.strength && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                {medicine.strength}
                              </span>
                            )}
                            {medicine.unit && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {medicine.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      Không có thuốc nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form nhập thông tin thuốc */}
          {selectedMedicine && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin thuốc: {selectedMedicine.name}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liều lượng *
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="VD: 1 viên, 5ml..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tần suất *
                  </label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="VD: 2 lần/ngày, 3 lần/ngày..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian *
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="VD: 7 ngày, 2 tuần..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hướng dẫn
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="VD: Uống sau ăn, uống trước khi ngủ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {!isVisitCompleted && (
                <div className="flex justify-end">
                  <button
                    onClick={handleAddMedicineToList}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    Thêm vào đơn
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bảng Đơn thuốc */}
          <div className="mb-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Thao tác
                      </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prescriptionItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Chưa có thuốc nào được thêm vào đơn
                      </td>
                    </tr>
                  ) : (
                    prescriptionItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.medicineName}
                          </div>
                          {item.medicine.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.medicine.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.duration}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.instructions || 'Không có hướng dẫn đặc biệt'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!isVisitCompleted && (
                            <button
                              onClick={() => handleRemoveMedicineFromList(item.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Xóa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Nút quản lý đơn thuốc */}
            {!isVisitCompleted && (
              <div className="flex justify-end space-x-3 mt-4">
                {prescriptionItems.length > 0 && (
                  <button
                    onClick={handleDeletePrescription}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                  >
                    Xóa đơn thuốc
                  </button>
                )}
                <button
                  onClick={handleSavePrescription}
                  disabled={prescriptionItems.length === 0 || savingPrescription}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                {savingPrescription ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  prescriptionId ? 'Cập nhật đơn thuốc' : 'Tạo đơn thuốc'
                )}
              </button>
            </div>
            )}
          </div>
        </div>

        {/* Submit Buttons - Chỉ hiển thị khi bệnh nhân ở trạng thái RETURNING và chưa hoàn thành */}
        {visitData?.status === 'RETURNING' && !isVisitCompleted && (
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleComplete}
              disabled={completingVisit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {completingVisit ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang hoàn thành...</span>
                </div>
              ) : (
                'Hoàn thành'
              )}
            </button>
            <button
              onClick={handleCompleteAndSchedule}
              disabled={completingVisit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {completingVisit ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang hoàn thành...</span>
                </div>
              ) : (
                'Hoàn thành và đặt lịch tái khám'
              )}
            </button>
          </div>
        )}
      </Card>

      {/* Modal xác nhận hoàn thành khám bệnh */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận hoàn thành
                </h3>
                <p className="text-sm text-gray-500">
                  Hoàn thành khám bệnh cho bệnh nhân
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn hoàn thành khám bệnh cho bệnh nhân <span className="font-semibold">{visitData?.patientName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Sau khi hoàn thành, bạn sẽ không thể chỉnh sửa thông tin khám bệnh nữa.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelComplete}
                disabled={completingVisit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={completingVisit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {completingVisit ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang hoàn thành...</span>
                  </div>
                ) : (
                  'Xác nhận hoàn thành'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông tin lịch khám */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Thông tin lịch khám
              </h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Loading State */}
            {loadingAppointment && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang tải thông tin lịch khám...</span>
                </div>
              </div>
            )}

            {/* Content */}
            {!loadingAppointment && (
              <div className="space-y-6">
                {/* Thông tin bệnh nhân */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <User size={20} className="text-blue-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Thông tin bệnh nhân</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tên bệnh nhân
                      </label>
                      <p className="text-gray-900 font-medium">
                        {appointmentData?.name || visitData?.patientName || 'Nguyễn Văn An'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Số điện thoại
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.phoneNumber || '0912345678'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.email || 'an.nguyen@gmail.com'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày sinh
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.dateOfBirth 
                          ? new Date(appointmentData.dateOfBirth).toLocaleDateString('vi-VN')
                          : '12/4/1988'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Giới tính
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.gender || 'Nam'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Địa chỉ
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.address || '45 Lê Lợi, Quận 1, TP.HCM'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin lịch hẹn */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Calendar size={20} className="text-green-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Thông tin lịch hẹn</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày khám
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.date 
                          ? new Date(appointmentData.date).toLocaleDateString('vi-VN')
                          : '3/8/2025'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Trạng thái
                      </label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointmentData?.status || 'IN_EXAMINATION_PROGRESS')}`}>
                        {getStatusText(appointmentData?.status || 'IN_EXAMINATION_PROGRESS')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Bác sĩ yêu cầu
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.requiredDoctorName || 'Hồ Thuỳ Ngân'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày hết hạn
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.expiredAt 
                          ? new Date(appointmentData.expiredAt).toLocaleDateString('vi-VN')
                          : '4/8/2025'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tổng tiền
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {appointmentData?.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin y tế */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <FileText size={20} className="text-red-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Thông tin y tế</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Triệu chứng
                    </label>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-gray-900">
                        {appointmentData?.symptom || 'Sốt cao, đau đầu, mệt mỏi'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        ID lịch hẹn
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {appointmentData?.id || visitData?.appointmentId || '076fde10-51c6-4638-ad41-2a97b2275600'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày tạo
                      </label>
                      <p className="text-gray-900">
                        {appointmentData?.createdAt 
                          ? `${new Date(appointmentData.createdAt).toLocaleDateString('vi-VN')} ${new Date(appointmentData.createdAt).toLocaleTimeString('vi-VN')}`
                          : '3/8/2025 04:09:09'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hồ sơ bệnh nhân */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Hồ sơ bệnh nhân
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Loading State */}
            {loadingPatient && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang tải thông tin hồ sơ bệnh nhân...</span>
                </div>
              </div>
            )}

            {/* Content */}
            {!loadingPatient && (
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Họ và tên
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {patientData?.name || visitData?.patientName || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        CCCD/CMND
                      </label>
                      <p className="text-gray-900">
                        {patientData?.citizenId || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Số điện thoại
                      </label>
                      <p className="text-gray-900">
                        {patientData?.phoneNumber || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {patientData?.email || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày sinh
                      </label>
                      <p className="text-gray-900">
                        {patientData?.dateOfBirth 
                          ? new Date(patientData.dateOfBirth).toLocaleDateString('vi-VN')
                          : 'Chưa có thông tin'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Giới tính
                      </label>
                      <p className="text-gray-900">
                        {patientData?.gender || 'Chưa có thông tin'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin liên hệ và địa chỉ */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <FileText size={20} className="text-blue-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Thông tin liên hệ</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Địa chỉ
                      </label>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-gray-900">
                          {patientData?.address || 'Chưa có thông tin'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        ID hồ sơ
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {patientData?.id || visitData?.patientProfileId || 'Chưa có thông tin'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleViewMedicalRecord}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Hồ sơ bệnh án
              </button>
              <button
                onClick={() => setShowPatientModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal kết quả xét nghiệm */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Kết quả xét nghiệm - {selectedAssignment?.laboratoryRoomName}
              </h3>
              <button
                onClick={() => {
                  setShowResultModal(false);
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
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
                        {selectedAssignment?.laboratoryRoomName || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Trạng thái
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExaminationStatusColor(selectedAssignment?.status || 'PENDING')}`}>
                        {getExaminationStatusText(selectedAssignment?.status || 'PENDING')}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Dịch vụ
                      </label>
                      <p className="text-gray-900">
                        {selectedAssignment?.assignmentServices && selectedAssignment.assignmentServices.length > 0 
                          ? selectedAssignment.assignmentServices.map((service: any) => service.serviceName).join(', ')
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
                          {laboratoryResult.files.map((file: any, index: number) => (
                            <div key={file.id || index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {/* Preview ảnh */}
                              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                {file.url ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.fileName || `Kết quả ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback khi không load được ảnh
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
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
                          {/* Debug info */}
                          <div className="mt-4 text-xs text-gray-400 text-left">
                            <p>Debug - Laboratory Result Keys:</p>
                            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {laboratoryResult ? JSON.stringify(Object.keys(laboratoryResult), null, 2) : 'No result'}
                            </pre>
                            {laboratoryResult && (
                              <>
                                <p className="mt-2">Files property:</p>
                                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                  {JSON.stringify(laboratoryResult.files, null, 2)}
                                </pre>
                              </>
                            )}
                          </div>
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
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setSelectedAssignment(null);
                  setLaboratoryResult(null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hồ sơ bệnh án */}
      {showMedicalRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Hồ sơ bệnh án
              </h3>
              <button
                onClick={() => {
                  setShowMedicalRecordModal(false);
                  setMedicalRecordData(null);
                  setExaminationHistory([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Loading State */}
            {loadingMedicalRecord && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang tải hồ sơ bệnh án...</span>
                </div>
              </div>
            )}

            {/* Content */}
            {!loadingMedicalRecord && (
              <div className="space-y-6">
                {/* Thông tin hồ sơ bệnh án */}
                {medicalRecordData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <FileText size={20} className="text-blue-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">Thông tin hồ sơ bệnh án</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Mã hồ sơ
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {medicalRecordData.medicalRecordId || 'Chưa có thông tin'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Mã bệnh nhân
                        </label>
                        <p className="text-gray-900">
                          {medicalRecordData.patientProfileId || visitData?.patientProfileId || 'Chưa có thông tin'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bảng lịch sử khám bệnh */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Lịch sử khám bệnh</h4>
                  </div>
                  
                  {loadingExaminationHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Đang tải lịch sử khám bệnh...</span>
                      </div>
                    </div>
                  ) : examinationHistory.length > 0 ? (
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
                          {examinationHistory.map((result, index) => (
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
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Chưa có lịch sử khám bệnh nào cho hồ sơ này.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowMedicalRecordModal(false);
                  setMedicalRecordData(null);
                  setExaminationHistory([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đặt lịch tái khám */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                Đặt Lịch Tái Khám
              </h3>
              <button
                onClick={handleCancelReschedule}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isRescheduling}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin bệnh nhân</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên bệnh nhân *
                    </label>
                    <input
                      type="text"
                      value={rescheduleFormData.name}
                      onChange={(e) => handleRescheduleInputChange('name', e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={rescheduleFormData.email}
                      onChange={(e) => handleRescheduleInputChange('email', e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      value={rescheduleFormData.phone}
                      onChange={(e) => handleRescheduleInputChange('phone', e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh *
                    </label>
                    <input
                      type="date"
                      value={rescheduleFormData.birthdate}
                      onChange={(e) => handleRescheduleInputChange('birthdate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính *
                    </label>
                    <select
                      value={rescheduleFormData.gender}
                      onChange={(e) => handleRescheduleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={rescheduleFormData.address}
                      onChange={(e) => handleRescheduleInputChange('address', e.target.value)}
                      placeholder="Địa chỉ hiện tại"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Triệu chứng
                  </label>
                  <textarea
                    value={rescheduleFormData.symptoms}
                    onChange={(e) => handleRescheduleInputChange('symptoms', e.target.value)}
                    placeholder="Mô tả triệu chứng hiện tại..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Appointment Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Chọn Thời Gian</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày khám *
                    </label>
                    <input
                      type="date"
                      value={rescheduleFormData.date}
                      onChange={(e) => handleRescheduleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ khám *
                    </label>
                    <select
                      value={rescheduleFormData.timeSlotId}
                      onChange={(e) => handleRescheduleInputChange('timeSlotId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn giờ</option>
                      {timeSlots && timeSlots.length > 0 ? (
                        timeSlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slot.name} ({slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Đang tải...</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleConfirmReschedule}
                disabled={isRescheduling || !validateRescheduleForm()}
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-3 text-base font-semibold text-white shadow-md ring-1 ring-blue-300/40 hover:from-indigo-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRescheduling ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Hoàn thành và đặt lịch tái khám
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExaminationForm;
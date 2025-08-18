import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Phone,
  Mail,
  Eye,
  Edit,
  X,
  Trash2,
} from "lucide-react";
import {
  appointmentService,
  Appointment,
  VisitRequestDTO,
} from "@/shared/services/appointmentService";
import { adminService } from "@/shared/services/adminService";
import { patientService } from "@/shared/services/patientService";
import { useToast } from "@/shared/components/ui/use-toast";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  // State cho tìm kiếm hồ sơ bệnh nhân
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [patientSearchError, setPatientSearchError] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // State cho modal tạo hồ sơ bệnh nhân
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: "",
    citizenId: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "Nam",
    address: "",
  });

  // State cho modal cập nhật bệnh nhân
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingPatient, setUpdatingPatient] = useState(false);
  const [updatePatientForm, setUpdatePatientForm] = useState({
    name: "",
    citizenId: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "Nam",
    address: "",
  });
  const [selectedPatientForUpdate, setSelectedPatientForUpdate] =
    useState<any>(null);

  // State cho validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    citizenId: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
  });

  // State cho validation errors của form cập nhật
  const [updateFormErrors, setUpdateFormErrors] = useState({
    name: "",
    citizenId: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
  });

  // State cho modal chọn phòng khám và bác sĩ
  const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [examinationRooms, setExaminationRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [currentShift, setCurrentShift] = useState<string>("");

  // State cho modal cập nhật lịch hẹn
  const [showUpdateAppointmentModal, setShowUpdateAppointmentModal] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);

  // State cho modal xác nhận thanh toán
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [updateAppointmentForm, setUpdateAppointmentForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "Nam",
    address: "",
    symptom: "",
    requiredDoctorId: "",
    timeSlotId: "",
  });
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isPriority, setIsPriority] = useState(false);

  // State cho modal hủy lịch hẹn
  const [showCancelAppointmentModal, setShowCancelAppointmentModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Thử lấy từ sessionStorage trước (nếu có)
        const storedAppointment = sessionStorage.getItem("selectedAppointment");
        if (storedAppointment) {
          const parsedAppointment = JSON.parse(storedAppointment);
          if (parsedAppointment.id === id) {
            setAppointment(parsedAppointment);
            setLoading(false);
            return;
          }
        }

        // Thử lấy từ API getAppointmentById
        try {
          const result = await appointmentService.getAppointmentById(id);
          setAppointment(result);
          setLoading(false);
          return;
        } catch (apiError) {
          console.log("getAppointmentById failed, trying getAllAppointment...");
        }

        // Nếu không được, thử lấy từ danh sách và filter theo ID
        const result = await appointmentService.getAllAppointment({
          pageSize: 1000,
        });
        if (result && result.data && result.data[0] && result.data[0].items) {
          const appointment = result.data[0].items.find(
            (app: Appointment) => app.id === id
          );
          if (appointment) {
            setAppointment(appointment);
            return;
          }
        }

        // Nếu vẫn không tìm thấy
        setAppointment(null);
      } catch (error: any) {
        console.error("Error fetching appointment detail:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin lịch hẹn",
          variant: "destructive",
        });
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetail();
  }, [id, toast]);

  const handleCheckInAppointment = async () => {
    if (!appointment) return;

    try {
      await appointmentService.checkInAppointment(appointment.id);
      toast({
        title: "Thành công",
        description: "Đã check-in lịch hẹn",
      });
      // Refresh appointment data
      const result = await appointmentService.getAppointmentById(
        appointment.id
      );
      setAppointment(result);
    } catch (error: any) {
      console.error("Error checking in appointment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể check-in lịch hẹn",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = async () => {
    if (!appointment) return;

    try {
      console.log('Printing invoice for appointment:', appointment.id);
      
      // Gọi API để lấy PDF hóa đơn
      const pdfBlob = await appointmentService.printInvoice(appointment.id);
      
      // Tạo URL cho blob và tải xuống
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HoaDon_${appointment.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Thành công",
        description: "Đã tải xuống hóa đơn thành công",
      });
    } catch (error: any) {
      console.error("Error printing invoice:", error);
      toast({
        title: "Lỗi",
        description: "Không thể in hóa đơn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = () => {
    setShowPaymentConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!appointment) return;

    try {
      setProcessingPayment(true);
      
      // Gọi API để đánh dấu appointment đã thanh toán
      await appointmentService.markAsPaid(appointment.id);
      
      toast({
        title: "Thành công",
        description: "Đã đánh dấu thanh toán thành công",
      });
      
      // Refresh appointment data
      const result = await appointmentService.getAppointmentById(appointment.id);
      setAppointment(result);
      
      // Đóng modal
      setShowPaymentConfirmModal(false);
    } catch (error: any) {
      console.error("Error marking as paid:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái thanh toán",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClosePaymentConfirmModal = () => {
    setShowPaymentConfirmModal(false);
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    // Mở modal xác nhận hủy lịch hẹn
    setShowCancelAppointmentModal(true);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!appointment) return;

    try {
      setCancellingAppointment(true);
      
      // Gọi API để hủy appointment với lý do
      await appointmentService.cancelAppointment(appointment.id, cancelReason);
      
      toast({
        title: "Thành công",
        description: "Đã hủy lịch hẹn thành công",
      });
      
      // Refresh appointment data
      const result = await appointmentService.getAppointmentById(appointment.id);
      setAppointment(result);
      
      // Đóng modal và reset form
      setShowCancelAppointmentModal(false);
      setCancelReason("");
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      
      // Lấy thông báo lỗi cụ thể từ response
      let errorMessage = "Không thể hủy lịch hẹn";
      
      if (error.response && error.response.data) {
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCancellingAppointment(false);
    }
  };

  const handleCloseCancelAppointmentModal = () => {
    setShowCancelAppointmentModal(false);
    setCancelReason("");
  };

    const handleOpenUpdateAppointmentModal = () => {
    if (!appointment) return;

    setUpdateAppointmentForm({
      name: appointment.name,
      phoneNumber: appointment.phoneNumber,
      email: appointment.email,
      dateOfBirth: appointment.dateOfBirth,
      gender: appointment.gender,
      address: appointment.address,
      symptom: appointment.symptom,
      requiredDoctorId: appointment.requiredDoctorId,
      timeSlotId: appointment.timeSlotId,
    });
    setShowUpdateAppointmentModal(true);
  };

  const handleCloseUpdateAppointmentModal = () => {
    setShowUpdateAppointmentModal(false);
    setUpdateAppointmentForm({
      name: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "Nam",
      address: "",
      symptom: "",
      requiredDoctorId: "",
      timeSlotId: "",
    });
  };

  const handleUpdateAppointment = async () => {
    if (!appointment) return;

    try {
      setUpdatingAppointment(true);
      
      // Chỉ gửi các trường cần cập nhật, giữ nguyên các trường khác
      const updateData = {
        name: updateAppointmentForm.name,
        phoneNumber: updateAppointmentForm.phoneNumber,
        email: updateAppointmentForm.email,
        dateOfBirth: updateAppointmentForm.dateOfBirth,
        gender: updateAppointmentForm.gender,
        address: updateAppointmentForm.address,
        symptom: updateAppointmentForm.symptom,
        // Giữ nguyên các trường này từ appointment gốc
        requiredDoctorId: appointment.requiredDoctorId,
        date: appointment.date,
        timeSlotId: appointment.timeSlotId,
      };
      
      // Gọi API để cập nhật lịch hẹn
      await appointmentService.updateAppointmentReceptionist(appointment.id, updateData);
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch hẹn thành công",
      });
      
      // Refresh appointment data
      const result = await appointmentService.getAppointmentById(appointment.id);
      setAppointment(result);
      
      // Đóng modal
      handleCloseUpdateAppointmentModal();
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setUpdatingAppointment(false);
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
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_EXAMINATION_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "IN_LABORATORY_PROGRESS":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
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
      case "PENDING":
        return "Đang chờ thanh toán";
      case "IN_EXAMINATION_PROGRESS":
        return "Đang khám";
      case "IN_LABORATORY_PROGRESS":
        return "Đang xét nghiệm";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Hàm chọn bệnh nhân
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
  };

  // Hàm mở modal tạo hồ sơ bệnh nhân
  const handleOpenCreateModal = () => {
    if (appointment) {
      // Kiểm tra và sửa ngày sinh nếu là ngày trong tương lai
      let dateOfBirth = "";
      if (appointment.dateOfBirth) {
        const dobDate = new Date(appointment.dateOfBirth);
        const today = new Date();

        // Nếu ngày sinh là trong tương lai, sử dụng ngày hôm nay
        if (dobDate > today) {
          dateOfBirth = today.toLocaleDateString("en-CA");
        } else {
          dateOfBirth = dobDate.toLocaleDateString("en-CA");
        }
      }

      setPatientForm({
        name: appointment.name || "",
        citizenId: "", // Luôn khởi tạo là chuỗi rỗng
        phoneNumber: appointment.phoneNumber || "",
        email: appointment.email || "",
        dateOfBirth: dateOfBirth,
        gender: appointment.gender || "Nam",
        address: appointment.address || "",
      });
    }
    setShowCreateModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setPatientForm({
      name: "",
      citizenId: "", // Luôn là chuỗi rỗng
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "Nam",
      address: "",
    });
    // Reset validation errors
    setFormErrors({
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    });
  };

  // Hàm mở modal cập nhật bệnh nhân
  const handleOpenUpdateModal = (patient: any) => {
    setSelectedPatientForUpdate(patient);
    setUpdatePatientForm({
      name: patient.name || "",
      citizenId: patient.citizenId || "",
      phoneNumber: patient.phoneNumber || "",
      email: patient.email || "",
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: patient.gender || "Nam",
      address: patient.address || "",
    });
    setUpdateFormErrors({
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    });
    setShowUpdateModal(true);
  };

  // Hàm đóng modal cập nhật
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatePatientForm({
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "Nam",
      address: "",
    });
    setUpdateFormErrors({
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    });
    setSelectedPatientForUpdate(null);
  };

  // Hàm validation cho form cập nhật
  const validateUpdateForm = () => {
    const errors = {
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    };

    // Validate tên
    if (!updatePatientForm.name.trim()) {
      errors.name = "Tên bệnh nhân là bắt buộc";
    } else if (updatePatientForm.name.trim().length < 2) {
      errors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(updatePatientForm.name.trim())) {
      errors.name = "Tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // Validate CCCD
    if (!updatePatientForm.citizenId.trim()) {
      errors.citizenId = "CCCD là bắt buộc";
    } else if (!/^\d{12}$/.test(updatePatientForm.citizenId.trim())) {
      errors.citizenId = "CCCD phải có đúng 12 chữ số";
    }

    // Validate số điện thoại
    if (!updatePatientForm.phoneNumber.trim()) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (
      !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(
        updatePatientForm.phoneNumber.trim()
      )
    ) {
      errors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0325278883)";
    }

    // Validate email (nếu có)
    if (updatePatientForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updatePatientForm.email.trim())) {
        errors.email = "Email không hợp lệ";
      }
    }

    // Validate ngày sinh
    if (!updatePatientForm.dateOfBirth) {
      errors.dateOfBirth = "Ngày sinh là bắt buộc";
    } else {
      const dobDate = new Date(updatePatientForm.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dobDate.getTime())) {
        errors.dateOfBirth = "Ngày sinh không hợp lệ";
      } else if (dobDate > today) {
        errors.dateOfBirth = "Ngày sinh không thể là ngày trong tương lai";
      } else if (dobDate.getFullYear() < 1900) {
        errors.dateOfBirth = "Ngày sinh không hợp lệ (trước năm 1900)";
      }
    }

    // Validate giới tính
    if (!updatePatientForm.gender) {
      errors.gender = "Giới tính là bắt buộc";
    }

    setUpdateFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  // Hàm cập nhật bệnh nhân
  const handleUpdatePatient = async () => {
    if (!selectedPatientForUpdate) return;

    // Validate form trước khi submit
    if (!validateUpdateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPatient(true);
    try {
      const updatedPatient = await adminService.updatePatient(
        selectedPatientForUpdate.id,
        updatePatientForm
      );

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin bệnh nhân thành công",
      });

      // Cập nhật lại danh sách bệnh nhân
      if (patientResults.length > 0) {
        const updatedResults = patientResults.map((patient) =>
          patient.id === selectedPatientForUpdate.id
            ? { ...patient, ...updatePatientForm }
            : patient
        );
        setPatientResults(updatedResults);

        // Cập nhật selectedPatient nếu đang được chọn
        if (
          selectedPatient &&
          selectedPatient.id === selectedPatientForUpdate.id
        ) {
          setSelectedPatient({ ...selectedPatient, ...updatePatientForm });
        }
      }

      handleCloseUpdateModal();
    } catch (error: any) {
      console.error("Error updating patient:", error);
      
      // Lấy thông báo lỗi cụ thể từ response
      let errorMessage = "Không thể cập nhật thông tin bệnh nhân";
      
      if (error.response && error.response.data) {
        // Nếu có response data, ưu tiên lấy message từ đó (kiểm tra cả chữ hoa và chữ thường)
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdatingPatient(false);
    }
  };

  // Hàm mở modal chọn phòng khám và bác sĩ
  const handleOpenRoomSelectionModal = async () => {
    try {
      // Lấy thời gian và ngày hiện tại
      const now = new Date();

      // Format ngày thành "YYYY-MM-DD"
      const currentDate = now.toISOString().split("T")[0]; // Format: "2025-07-31"

      // Xác định ca làm việc dựa trên giờ hiện tại
      let currentTime: string;
      let shiftName: string;
      const currentHour = now.getHours();

      if (currentHour >= 8 && currentHour < 12) {
        // Ca Sáng: 08:00:00 - 12:00:00
        currentTime = "08:00:00";
        shiftName = "Ca Sáng";
      } else if (currentHour >= 13 && currentHour < 17) {
        // Ca Chiều: 13:00:00 - 17:00:00
        currentTime = "13:00:00";
        shiftName = "Ca Chiều";
      } else if (currentHour >= 18 && currentHour < 24) {
        // Ca Tối: 18:00:00 - 22:00:00
        currentTime = "18:00:00";
        shiftName = "Ca Tối";
      } else {
        // Ngoài giờ làm việc
        toast({
          title: "Thông báo",
          description: "Hiện tại không trong giờ làm việc của phòng khám",
          variant: "destructive",
        });
        return;
      }

      // Lưu thông tin ca làm việc hiện tại TRƯỚC KHI mở modal
      setCurrentShift(shiftName);
      setCurrentDate(currentDate);

      // Mở modal và bắt đầu loading
      setShowRoomSelectionModal(true);
      setLoadingRooms(true);

      // Gọi API lấy danh sách phòng khám
      const rooms = await appointmentService.getExaminationRoomsByDate(
        currentTime,
        currentDate
      );
      setExaminationRooms(rooms);
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phòng khám",
        variant: "destructive",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  // Hàm đóng modal chọn phòng khám
  const handleCloseRoomSelectionModal = () => {
    setShowRoomSelectionModal(false);
    setExaminationRooms([]);
    setSelectedRoom(null);
    setCurrentShift("");
    setCurrentDate("");
    setIsPriority(false);
  };

  // Hàm chọn phòng khám
  const handleSelectRoom = async (room: any) => {
    // Validate: Kiểm tra xem phòng đã có bác sĩ được phân công chưa
    if (!room.doctorName || room.doctorName === "Chưa phân công") {
      toast({
        title: "Không thể chọn phòng",
        description: "Phòng này chưa được phân công bác sĩ",
        variant: "destructive",
      });
      return;
    }

    // Validate: Kiểm tra xem đã có bệnh nhân được chọn chưa
    if (!selectedPatient) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn bệnh nhân trước khi vào khám",
        variant: "destructive",
      });
      return;
    }

    // Validate: Kiểm tra xem có appointment không
    if (!appointment) {
      toast({
        title: "Lỗi",
        description: "Không có thông tin lịch hẹn",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("=== BẮT ĐẦU TẠO VISIT ===");
      console.log("Selected room:", room);
      console.log("Selected patient:", selectedPatient);
      console.log("Is priority:", isPriority);
      console.log("Appointment:", appointment);

      // Tạo dữ liệu visit
      const visitData: VisitRequestDTO = {
        examinationRoomId: room.room.id,
        appointmentId: appointment.id,
        assignedDoctorId: room.doctorId,
        patientProfileId: selectedPatient.id,
        isPrioritized: isPriority
      };

      console.log("Visit data to send:", visitData);

      // Gọi API tạo visit
      const result = await appointmentService.createVisit(visitData);
      
      console.log("Create visit result:", result);
      console.log("=== TẠO VISIT THÀNH CÔNG ===");

      setSelectedRoom(room);
      const priorityText = isPriority ? " (Ưu tiên)" : "";
      toast({
        title: "Thành công",
        description: `Đã tạo visit cho phòng: ${room.room.name}${priorityText}`,
      });
      
      // Refresh appointment data để cập nhật trạng thái
      try {
        const updatedAppointment = await appointmentService.getAppointmentById(appointment.id);
        setAppointment(updatedAppointment);
      } catch (refreshError) {
        console.error("Error refreshing appointment data:", refreshError);
        // Không hiển thị lỗi cho user vì visit đã tạo thành công
      }
      
      handleCloseRoomSelectionModal();
      
      // Chuyển hướng về trang danh sách lịch hẹn sau khi tạo visit thành công
      setTimeout(() => {
        navigate("/receptionist/appointments");
      }, 500); // Delay 0.5 giây để user có thể thấy thông báo thành công
    } catch (error: any) {
      console.error("=== LỖI KHI TẠO VISIT ===");
      console.error("Error:", error);
      console.error("Error response:", error?.response?.data);
      
      // Lấy thông báo lỗi cụ thể từ response
      let errorMessage = "Không thể tạo visit";
      
      if (error.response && error.response.data) {
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Hàm validation
  const validateForm = () => {
    const errors = {
      name: "",
      citizenId: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    };

    // Validate tên (không cần validate vì đã disabled)
    // if (!patientForm.name.trim()) {
    //   errors.name = "Tên bệnh nhân là bắt buộc";
    // }

    // Validate CCCD (không bắt buộc - bỏ validation)
    // Chỉ validate format nếu có nhập
    if (patientForm.citizenId.trim() && !/^\d{12}$/.test(patientForm.citizenId.trim())) {
      errors.citizenId = "CCCD phải có đúng 12 chữ số";
    }

    // Validate số điện thoại
    if (!patientForm.phoneNumber.trim()) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (
      !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(patientForm.phoneNumber.trim())
    ) {
      errors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0325278883)";
    }

    // Validate email (nếu có)
    if (patientForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientForm.email.trim())) {
        errors.email = "Email không hợp lệ";
      }
    }

    // Validate ngày sinh (không cần validate vì đã disabled)
    // if (!patientForm.dateOfBirth) {
    //   errors.dateOfBirth = "Ngày sinh là bắt buộc";
    // }

    // Validate giới tính (không cần validate vì đã disabled)
    // if (!patientForm.gender) {
    //   errors.gender = "Giới tính là bắt buộc";
    // }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  // Hàm tạo hồ sơ bệnh nhân
  const handleCreatePatient = async () => {
    // Validate form trước khi submit
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });
      return;
    }

    setCreatingPatient(true);
    try {
      // Chuẩn bị dữ liệu để gửi API - đảm bảo citizenId luôn là chuỗi rỗng nếu không có giá trị
      const patientData = {
        ...patientForm,
        citizenId: patientForm.citizenId.trim() || "", // Đảm bảo citizenId luôn là chuỗi rỗng nếu không có giá trị
        email: patientForm.email.trim() || "", // Tương tự cho email
        address: patientForm.address.trim() || "", // Tương tự cho address
      };

      const newPatient = await adminService.createPatient(patientData);

      // Nếu API trả về thành công nhưng không có name, vẫn coi là thành công
      // vì có thể API trả về cấu trúc khác hoặc name nằm trong field khác
      const patientName =
        newPatient?.name || newPatient?.fullName || patientForm.name;

      toast({
        title: "Thành công",
        description: "Đã tạo hồ sơ bệnh nhân thành công",
      });

      // Đóng modal trước
      handleCloseModal();
      
      // Gọi lại API tìm kiếm để refresh dữ liệu từ server
      await handleSearchPatient();
    } catch (error: any) {
      console.error("Error creating patient:", error);
      
      // Lấy thông báo lỗi cụ thể từ response
      let errorMessage = "Không thể tạo hồ sơ bệnh nhân";
      
      if (error.response && error.response.data) {
        // Nếu có response data, ưu tiên lấy message từ đó (kiểm tra cả chữ hoa và chữ thường)
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingPatient(false);
    }
  };

  // Hàm tìm kiếm hồ sơ bệnh nhân
  const handleSearchPatient = async () => {
    if (!appointment) {
      toast({
        title: "Lỗi",
        description: "Không có thông tin lịch hẹn",
        variant: 'destructive',
      });
      return;
    }

    setSearchingPatient(true);
    setPatientSearchError("");
    setPatientResults([]);
    setSelectedPatient(null);

    try {
      const patientName = appointment.name;
      const patientDOB = appointment.dateOfBirth ? 
        new Date(appointment.dateOfBirth).toLocaleDateString('en-CA') : '';

      if (!patientName) {
        setPatientSearchError("Không có thông tin tên bệnh nhân");
        return;
      }

      // Gọi API tìm kiếm bệnh nhân
      const params: any = { 
        pageNumber: 1, 
        pageSize: 1000
      };
      if (patientName) params.name = patientName;
      if (patientDOB) params.dateOfBirth = patientDOB;

      // Thử với adminService trước
      try {
        const nameOnlyParams = { 
          pageNumber: 1, 
          pageSize: 1000,
          name: patientName
        };
        const res = await adminService.getPatientList(nameOnlyParams);
        const patients = Array.isArray(res.items) ? res.items : [];
        if (patients.length > 0) {
          const filteredPatients = patients.filter((patient: any) => {
            const nameMatch = patient.name === patientName;
            let dobMatch = true;
            if (patientDOB && patient.dateOfBirth) {
              const patientDOBDate = new Date(patient.dateOfBirth).toLocaleDateString('en-CA');
              dobMatch = patientDOBDate === patientDOB;
            }
            return nameMatch && dobMatch;
          });
          setPatientResults(filteredPatients);

          if (filteredPatients.length === 0) {
            toast({
              title: "Thông báo",
              description: "Bệnh nhân chưa có hồ sơ bệnh nhân. Hãy tạo mới!",
              variant: "destructive",
            });
          }
          return;
        } else {
          toast({
            title: "Thông báo",
            description: "Bệnh nhân chưa có hồ sơ bệnh nhân. Hãy tạo mới!",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        // adminService failed, trying patientService...
      }

      // Nếu adminService không hoạt động, thử với patientService
      try {
        const res = await patientService.searchPatients(patientName);
        const patients = Array.isArray(res) ? res : [];
        const filteredPatients = patients.filter((patient: any) => {
          const nameMatch = patient.name === patientName;
          const dobMatch = patientDOB ? patient.dateOfBirth === patientDOB : true;
          return nameMatch && dobMatch;
        });
        setPatientResults(filteredPatients);

        if (filteredPatients.length === 0) {
          toast({
            title: "Thông báo",
            description: "Bệnh nhân chưa có hồ sơ bệnh nhân. Hãy tạo mới!",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Both services failed:', error);
        setPatientSearchError("Lỗi khi tìm kiếm hồ sơ bệnh nhân");
      }
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setPatientSearchError("Lỗi khi tìm kiếm hồ sơ bệnh nhân");
    } finally {
      setSearchingPatient(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          <span>Đang tải thông tin lịch hẹn...</span>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy lịch hẹn
          </h2>
          <p className="text-gray-600 mb-4">
            Lịch hẹn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate("/receptionist/appointments")}>
            Quay lại danh sách
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
            onClick={() => navigate("/receptionist/appointments")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </Button>
          <div>
            <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
              Chi tiết lịch hẹn
            </h1>
            <p className="text-gray-600">
              Thông tin chi tiết về lịch hẹn khám bệnh
            </p>
          </div>
        </div>
        
        {/* Nút Hủy lịch hẹn - Hiển thị cho các trạng thái có thể hủy */}
        {appointment && (
          appointment.status === "WAITING_FOR_CHECK_IN" || 
          appointment.status === "CHECKED_IN" || 
          appointment.status === "PENDING"
        ) && (
          <Button
            variant="destructive"
            onClick={handleCancelAppointment}
            disabled={cancellingAppointment}
            className="flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>{cancellingAppointment ? "Đang hủy..." : "Hủy lịch hẹn"}</span>
          </Button>
        )}

        {/* Hiển thị lý do hủy khi trạng thái là CANCELLED */}
        {appointment && appointment.status === "CANCELLED" && appointment.cancelReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Lý do hủy lịch hẹn
                </h4>
                <p className="text-sm text-red-700">
                  {appointment.cancelReason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Content */}
      <div className="space-y-6">
        {/* Patient Information Section */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4 flex items-center">
            <User size={20} className="mr-2" />
            Thông tin bệnh nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên bệnh nhân
              </label>
              <p className="text-gray-900 font-medium">{appointment.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Số điện thoại
              </label>
              <p className="text-gray-900">{appointment.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <p className="text-gray-900">{appointment.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ngày sinh
              </label>
              <p className="text-gray-900">
                {new Date(appointment.dateOfBirth).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Giới tính
              </label>
              <p className="text-gray-900">{appointment.gender}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Địa chỉ
              </label>
              <p className="text-gray-900">
                {appointment.address || "Không có"}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Information Section */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4 flex items-center">
            <Calendar size={20} className="mr-2" />
            Thông tin lịch hẹn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ngày khám
              </label>
              <p className="text-gray-900">
                {new Date(appointment.date).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Giờ khám
              </label>
              <p className="text-gray-900">
                {appointment.timeSlotStartTime.slice(0, 5)} -{" "}
                {appointment.timeSlotEndTime.slice(0, 5)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bác sĩ yêu cầu
              </label>
              <p className="text-gray-900">
                {appointment.requiredDoctorName || "Không có"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Trạng thái
              </label>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  appointment.status
                )}`}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tổng tiền
              </label>
              <p className="text-gray-900 font-semibold">
                {appointment.totalPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ngày hết hạn
              </label>
              <p className="text-gray-900">
                {new Date(appointment.expiredAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4">
            Thông tin y tế
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Triệu chứng
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                {appointment.symptom || "Không có"}
              </p>
            </div>
          </div>
        </div>

        {/* System Information Section */}
        <div className="clinic-card">
          <h3 className="text-lg font-semibold text-clinic-navy mb-4">
            Thông tin hệ thống
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                ID lịch hẹn
              </label>
              <p className="text-gray-900 font-mono text-sm">
                {appointment.id}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ngày tạo
              </label>
              <p className="text-gray-900">
                {new Date(appointment.createdAt).toLocaleDateString("vi-VN")}{" "}
                {new Date(appointment.createdAt).toLocaleTimeString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Section - Chỉ hiển thị khi trạng thái là PENDING */}
        {appointment.status === "PENDING" && (
          <div className="clinic-card">
            <h3 className="text-lg font-semibold text-clinic-navy mb-4">
              Thanh toán
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePrintInvoice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                In hoá đơn
              </Button>
              <Button
                onClick={handleMarkAsPaid}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Đã thanh toán
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons Section - Chỉ hiển thị khi đã check-in và chưa chọn bệnh nhân */}
        {appointment.status === "CHECKED_IN" && !selectedPatient && (
          <div className="clinic-card">
            <h3 className="text-lg font-semibold text-clinic-navy mb-4">
              Thao tác hồ sơ bệnh nhân
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSearchPatient}
                disabled={searchingPatient}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <User size={16} className="mr-2" />
                {searchingPatient ? "Đang tìm kiếm..." : "Tìm hồ sơ bệnh nhân"}
              </Button>
              <Button
                onClick={handleOpenCreateModal}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <User size={16} className="mr-2" />
                Tạo hồ sơ bệnh nhân
              </Button>
            </div>
          </div>
        )}

        {/* Patient Search Results */}
        {patientResults.length > 0 && (
          <div className="clinic-card">
            <h3 className="text-lg font-semibold text-clinic-navy mb-4">
              Kết quả tìm kiếm hồ sơ bệnh nhân
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                      Họ tên
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                      Liên hệ
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                      Ngày sinh
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                      Địa chỉ
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                      Giới tính
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-clinic-navy">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPatient ? (
                    // Chỉ hiển thị bệnh nhân đã chọn
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-medium text-clinic-navy">
                            {selectedPatient.name || "N/A"}
                          </h4>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone size={14} />
                            <span>{selectedPatient.phoneNumber || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} />
                            <span>{selectedPatient.email || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {selectedPatient.dateOfBirth
                          ? new Date(
                              selectedPatient.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {selectedPatient.address || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedPatient.gender === "Nam"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedPatient.gender || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              handleOpenUpdateModal(selectedPatient)
                            }
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Chi Tiết
                          </button>
                          <button
                            onClick={handleOpenRoomSelectionModal}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Vào khám
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Hiển thị tất cả bệnh nhân với nút chọn
                    patientResults.map((patient: any) => (
                      <tr
                        key={patient.id || patient.citizenId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <h4 className="font-medium text-clinic-navy">
                              {patient.name || "N/A"}
                            </h4>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone size={14} />
                              <span>{patient.phoneNumber || "N/A"}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail size={14} />
                              <span>{patient.email || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {patient.address || "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              patient.gender === "Nam"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {patient.gender || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Chọn
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {patientSearchError && (
          <div className="clinic-card">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                <User size={48} className="mx-auto mb-4 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Không tìm thấy hồ sơ
              </h3>
              <p className="text-gray-500">{patientSearchError}</p>
            </div>
          </div>
        )}

        {/* Modal tạo hồ sơ bệnh nhân */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-clinic-navy">
                  Thêm bệnh nhân mới
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Họ và tên *
                  </Label>
                  <Input
                    id="name"
                    value={patientForm.name}
                    disabled={true}
                    placeholder="Nhập họ và tên"
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="citizenId" className="text-sm font-medium">
                    CCCD
                  </Label>
                  <Input
                    id="citizenId"
                    value={patientForm.citizenId}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        citizenId: e.target.value || "", // Đảm bảo luôn là chuỗi
                      });
                      if (formErrors.citizenId) {
                        setFormErrors({ ...formErrors, citizenId: "" });
                      }
                    }}
                    placeholder="Nhập số CCCD (12 chữ số) "
                    className={`mt-1 ${
                      formErrors.citizenId
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {formErrors.citizenId && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formErrors.citizenId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Số điện thoại *
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={patientForm.phoneNumber}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        phoneNumber: e.target.value,
                      });
                      if (formErrors.phoneNumber) {
                        setFormErrors({ ...formErrors, phoneNumber: "" });
                      }
                    }}
                    placeholder="VD: 0325278883"
                    className={`mt-1 ${
                      formErrors.phoneNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => {
                      setPatientForm({ ...patientForm, email: e.target.value });
                      if (formErrors.email) {
                        setFormErrors({ ...formErrors, email: "" });
                      }
                    }}
                    placeholder="Nhập email"
                    className={`mt-1 ${
                      formErrors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Ngày sinh *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patientForm.dateOfBirth}
                    disabled={true}
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Giới tính *
                  </Label>
                  <Select
                    value={patientForm.gender}
                    disabled={true}
                  >
                    <SelectTrigger className="mt-1 bg-gray-100 cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    value={patientForm.address}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Nhập địa chỉ"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={creatingPatient}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreatePatient}
                  disabled={creatingPatient}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creatingPatient ? "Đang tạo..." : "Lưu thông tin"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chọn phòng khám và bác sĩ */}
        {showRoomSelectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-clinic-navy">
                    Chọn phòng khám & bác sĩ
                  </h3>
                  {currentShift && currentDate && (
                    <p className="text-sm text-red-600 font-bold mt-1">
                      {currentShift} -{" "}
                      {new Date(currentDate).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseRoomSelectionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Loading */}
              {loadingRooms && (
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
                    <span>Đang tải danh sách phòng khám...</span>
                  </div>
                </div>
              )}

              {/* Table */}
              {!loadingRooms && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                          Phòng
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                          Bác sĩ
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-clinic-navy">
                          Số BN trong phòng
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-clinic-navy">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {examinationRooms.map((room, index) => (
                        <tr
                          key={room.room.id || index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <h4 className="font-medium text-clinic-navy">
                                {room.room.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {room.room.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">
                              {room.doctorName || "Chưa phân công"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700 font-medium">
                              {room.patientCount || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleSelectRoom(room)}
                                className={`px-3 py-1 rounded text-sm ${
                                  !room.doctorName || room.doctorName === "Chưa phân công"
                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                                disabled={!room.doctorName || room.doctorName === "Chưa phân công"}
                              >
                                {!room.doctorName || room.doctorName === "Chưa phân công" 
                                  ? "Không khả dụng" 
                                  : "Chọn"
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No rooms message */}
              {!loadingRooms && examinationRooms.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <Calendar
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Không có phòng khám
                  </h3>
                  <p className="text-gray-500">
                    Không có phòng khám nào khả dụng cho thời gian này
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center mt-6">
                {/* Checkbox ưu tiên ở góc trái */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priority-checkbox"
                    checked={isPriority}
                    onCheckedChange={(checked) => setIsPriority(checked as boolean)}
                  />
                  <Label 
                    htmlFor="priority-checkbox" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Được ưu tiên
                  </Label>
                </div>

                {/* Button đóng ở góc phải */}
                <Button
                  variant="outline"
                  onClick={handleCloseRoomSelectionModal}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal cập nhật bệnh nhân */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-clinic-navy">
                  Cập nhật bệnh nhân
                </h3>
                <button
                  onClick={handleCloseUpdateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update-name" className="text-sm font-medium">
                    Họ và tên *
                  </Label>
                  <Input
                    id="update-name"
                    value={updatePatientForm.name}
                    onChange={(e) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        name: e.target.value,
                      });
                      if (updateFormErrors.name) {
                        setUpdateFormErrors({ ...updateFormErrors, name: "" });
                      }
                    }}
                    placeholder="Nhập họ và tên"
                    className={`mt-1 ${
                      updateFormErrors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {updateFormErrors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="update-citizenId"
                    className="text-sm font-medium"
                  >
                    CCCD *
                  </Label>
                  <Input
                    id="update-citizenId"
                    value={updatePatientForm.citizenId}
                    onChange={(e) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        citizenId: e.target.value,
                      });
                      if (updateFormErrors.citizenId) {
                        setUpdateFormErrors({
                          ...updateFormErrors,
                          citizenId: "",
                        });
                      }
                    }}
                    placeholder="Nhập số CCCD (12 chữ số)"
                    className={`mt-1 ${
                      updateFormErrors.citizenId
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {updateFormErrors.citizenId && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.citizenId}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="update-phoneNumber"
                    className="text-sm font-medium"
                  >
                    Số điện thoại *
                  </Label>
                  <Input
                    id="update-phoneNumber"
                    value={updatePatientForm.phoneNumber}
                    onChange={(e) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        phoneNumber: e.target.value,
                      });
                      if (updateFormErrors.phoneNumber) {
                        setUpdateFormErrors({
                          ...updateFormErrors,
                          phoneNumber: "",
                        });
                      }
                    }}
                    placeholder="VD: 0325278883"
                    className={`mt-1 ${
                      updateFormErrors.phoneNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {updateFormErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="update-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="update-email"
                    type="email"
                    value={updatePatientForm.email}
                    onChange={(e) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        email: e.target.value,
                      });
                      if (updateFormErrors.email) {
                        setUpdateFormErrors({ ...updateFormErrors, email: "" });
                      }
                    }}
                    placeholder="Nhập email"
                    className={`mt-1 ${
                      updateFormErrors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {updateFormErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="update-dateOfBirth"
                    className="text-sm font-medium"
                  >
                    Ngày sinh *
                  </Label>
                  <Input
                    id="update-dateOfBirth"
                    type="date"
                    value={updatePatientForm.dateOfBirth}
                    onChange={(e) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        dateOfBirth: e.target.value,
                      });
                      if (updateFormErrors.dateOfBirth) {
                        setUpdateFormErrors({
                          ...updateFormErrors,
                          dateOfBirth: "",
                        });
                      }
                    }}
                    max={new Date().toISOString().split("T")[0]}
                    className={`mt-1 ${
                      updateFormErrors.dateOfBirth
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {updateFormErrors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="update-gender"
                    className="text-sm font-medium"
                  >
                    Giới tính *
                  </Label>
                  <Select
                    value={updatePatientForm.gender}
                    onValueChange={(value) => {
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        gender: value,
                      });
                      if (updateFormErrors.gender) {
                        setUpdateFormErrors({
                          ...updateFormErrors,
                          gender: "",
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`mt-1 ${
                        updateFormErrors.gender
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateFormErrors.gender && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {updateFormErrors.gender}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="update-address"
                    className="text-sm font-medium"
                  >
                    Địa chỉ
                  </Label>
                  <Input
                    id="update-address"
                    value={updatePatientForm.address}
                    onChange={(e) =>
                      setUpdatePatientForm({
                        ...updatePatientForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Nhập địa chỉ"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseUpdateModal}
                  disabled={updatingPatient}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdatePatient}
                  disabled={updatingPatient}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updatingPatient ? "Đang cập nhật..." : "Lưu thông tin"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cập nhật lịch hẹn */}
        {showUpdateAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-clinic-navy">
                  Cập nhật lịch hẹn
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseUpdateAppointmentModal}
                  disabled={updatingAppointment}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="update-name" className="text-sm font-medium">
                      Tên bệnh nhân *
                    </Label>
                    <Input
                      id="update-name"
                      value={updateAppointmentForm.name}
                      onChange={(e) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nhập tên bệnh nhân"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-phone" className="text-sm font-medium">
                      Số điện thoại *
                    </Label>
                    <Input
                      id="update-phone"
                      value={updateAppointmentForm.phoneNumber}
                      onChange={(e) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Nhập số điện thoại"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="update-email"
                      type="email"
                      value={updateAppointmentForm.email}
                      onChange={(e) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Nhập email"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-dob" className="text-sm font-medium">
                      Ngày sinh *
                    </Label>
                    <Input
                      id="update-dob"
                      type="date"
                      value={updateAppointmentForm.dateOfBirth}
                      onChange={(e) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                      max={new Date().toISOString().split("T")[0]}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-gender" className="text-sm font-medium">
                      Giới tính *
                    </Label>
                    <Select
                      value={updateAppointmentForm.gender}
                      onValueChange={(value) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          gender: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="update-address" className="text-sm font-medium">
                      Địa chỉ
                    </Label>
                    <Input
                      id="update-address"
                      value={updateAppointmentForm.address}
                      onChange={(e) =>
                        setUpdateAppointmentForm({
                          ...updateAppointmentForm,
                          address: e.target.value,
                        })
                      }
                      placeholder="Nhập địa chỉ"
                      className="mt-1"
                    />
                  </div>


                </div>

                <div>
                  <Label htmlFor="update-symptom-detail" className="text-sm font-medium">
                    Mô tả triệu chứng chi tiết
                  </Label>
                  <textarea
                    id="update-symptom-detail"
                    value={updateAppointmentForm.symptom}
                    onChange={(e) =>
                      setUpdateAppointmentForm({
                        ...updateAppointmentForm,
                        symptom: e.target.value,
                      })
                    }
                    placeholder="Mô tả chi tiết triệu chứng của bệnh nhân..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseUpdateAppointmentModal}
                  disabled={updatingAppointment}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdateAppointment}
                  disabled={updatingAppointment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updatingAppointment ? "Đang cập nhật..." : "Cập nhật lịch hẹn"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận thanh toán */}
        {showPaymentConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-clinic-navy">
                  Xác nhận thanh toán
                </h3>
                <button
                  onClick={handleClosePaymentConfirmModal}
                  disabled={processingPayment}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 text-center">
                  Bạn có chắc chắn rằng muốn thanh toán?
                </p>
                {appointment && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Bệnh nhân:</strong> {appointment.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Tổng tiền:</strong> {appointment.totalPrice.toLocaleString("vi-VN")} VNĐ
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Ngày khám:</strong> {new Date(appointment.date).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClosePaymentConfirmModal}
                  disabled={processingPayment}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={processingPayment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingPayment ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận hủy lịch hẹn */}
        {showCancelAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-clinic-navy">
                  Xác nhận hủy lịch hẹn
                </h3>
                <button
                  onClick={handleCloseCancelAppointmentModal}
                  disabled={cancellingAppointment}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
                </p>
                {appointment && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Bệnh nhân:</strong> {appointment.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Ngày khám:</strong> {new Date(appointment.date).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Giờ khám:</strong> {appointment.timeSlotStartTime.slice(0, 5)} - {appointment.timeSlotEndTime.slice(0, 5)}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700">
                    Lý do hủy lịch hẹn *
                  </Label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy lịch hẹn..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseCancelAppointmentModal}
                  disabled={cancellingAppointment}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmCancelAppointment}
                  disabled={cancellingAppointment || !cancelReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {cancellingAppointment ? "Đang hủy..." : "Xác nhận hủy"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;

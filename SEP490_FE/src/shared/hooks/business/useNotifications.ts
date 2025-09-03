import { useState, useEffect, useCallback, useRef } from 'react';
import signalRService from '@/shared/services/signalRService';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

// Global state to prevent duplicate notifications across multiple hook instances
let globalNotifications: Notification[] = [];
let globalListeners: Set<() => void> = new Set();
let isSignalRInitialized = false;

const notifyGlobalListeners = () => {
  globalListeners.forEach(listener => listener());
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(globalNotifications);
  const [isConnected, setIsConnected] = useState(false);

  // Update local state when global state changes
  const updateLocalState = useCallback(() => {
    setNotifications([...globalNotifications]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    globalNotifications = globalNotifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    );
    notifyGlobalListeners();
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    globalNotifications = globalNotifications.map(notif => ({ ...notif, isRead: true }));
    notifyGlobalListeners();
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    globalNotifications = globalNotifications.filter(notif => notif.id !== notificationId);
    notifyGlobalListeners();
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    globalNotifications = [];
    notifyGlobalListeners();
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Add notification manually (for testing or other purposes)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    };
    globalNotifications = [newNotification, ...globalNotifications.slice(0, 49)]; // Keep max 50 notifications
    notifyGlobalListeners();
  }, []);

  // SignalR event handlers - only initialize once globally
  useEffect(() => {
    // Prevent multiple initializations
    if (isSignalRInitialized) {
      return;
    }
    isSignalRInitialized = true;

    const handleScheduleUpdate = (schedule: any) => {
      const notification: Notification = {
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật lịch làm việc',
        message: `Lịch làm việc của ${schedule.doctorName || schedule.doctor?.name || 'bác sĩ'} đã được cập nhật`,
        timestamp: new Date(),
        isRead: false,
        data: schedule
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleScheduleDelete = (scheduleId: string) => {
      const notification: Notification = {
        id: `schedule-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa lịch làm việc',
        message: `Một lịch làm việc đã được xóa (ID: ${scheduleId})`,
        timestamp: new Date(),
        isRead: false,
        data: { scheduleId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleScheduleChangeRequest = (changeRequest: any) => {
      const notification: Notification = {
        id: `schedule-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Yêu cầu thay đổi lịch',
        message: `Có yêu cầu thay đổi lịch làm việc từ ${changeRequest.doctorName || changeRequest.doctor?.name || 'bác sĩ'}`,
        timestamp: new Date(),
        isRead: false,
        data: changeRequest
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleDoctorProfileUpdate = (doctorProfile: any) => {
      const notification: Notification = {
        id: `doctor-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật thông tin bác sĩ',
        message: `Thông tin bác sĩ ${doctorProfile.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: doctorProfile
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleDoctorProfileDelete = (doctorProfileId: string) => {
      const notification: Notification = {
        id: `doctor-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa thông tin bác sĩ',
        message: `Thông tin bác sĩ đã được xóa (ID: ${doctorProfileId})`,
        timestamp: new Date(),
        isRead: false,
        data: { doctorProfileId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleExaminationRoomUpdate = (room: any) => {
      const notification: Notification = {
        id: `room-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật phòng khám',
        message: `Phòng khám ${room.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: room
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleExaminationRoomDelete = (roomId: string) => {
      const notification: Notification = {
        id: `room-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa phòng khám',
        message: `Một phòng khám đã được xóa (ID: ${roomId})`,
        timestamp: new Date(),
        isRead: false,
        data: { roomId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleLaboratoryRoomUpdate = (room: any) => {
      const notification: Notification = {
        id: `lab-room-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật phòng xét nghiệm',
        message: `Phòng xét nghiệm ${room.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: room
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleLaboratoryRoomDelete = (roomId: string) => {
      const notification: Notification = {
        id: `lab-room-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa phòng xét nghiệm',
        message: `Một phòng xét nghiệm đã được xóa (ID: ${roomId})`,
        timestamp: new Date(),
        isRead: false,
        data: { roomId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleServiceUpdate = (service: any) => {
      const notification: Notification = {
        id: `service-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật dịch vụ',
        message: `Dịch vụ ${service.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: service
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleServiceDelete = (serviceId: string) => {
      const notification: Notification = {
        id: `service-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa dịch vụ',
        message: `Một dịch vụ đã được xóa (ID: ${serviceId})`,
        timestamp: new Date(),
        isRead: false,
        data: { serviceId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleSupplierUpdate = (supplier: any) => {
      const notification: Notification = {
        id: `supplier-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật nhà cung cấp',
        message: `Nhà cung cấp ${supplier.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: supplier
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleSupplierDelete = (supplierId: string) => {
      const notification: Notification = {
        id: `supplier-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa nhà cung cấp',
        message: `Một nhà cung cấp đã được xóa (ID: ${supplierId})`,
        timestamp: new Date(),
        isRead: false,
        data: { supplierId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleMedicineUpdate = (medicine: any) => {
      const notification: Notification = {
        id: `medicine-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật thuốc',
        message: `Thuốc ${medicine.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: medicine
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleMedicineDelete = (medicineId: string) => {
      const notification: Notification = {
        id: `medicine-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa thuốc',
        message: `Một loại thuốc đã được xóa (ID: ${medicineId})`,
        timestamp: new Date(),
        isRead: false,
        data: { medicineId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleCategoryUpdate = (category: any) => {
      const notification: Notification = {
        id: `category-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Cập nhật danh mục',
        message: `Danh mục ${category.name || 'đã được cập nhật'}`,
        timestamp: new Date(),
        isRead: false,
        data: category
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleCategoryDelete = (categoryId: string) => {
      const notification: Notification = {
        id: `category-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Xóa danh mục',
        message: `Một danh mục đã được xóa (ID: ${categoryId})`,
        timestamp: new Date(),
        isRead: false,
        data: { categoryId }
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleLowStockAlert = (summary: any) => {
      const notification: Notification = {
        id: `low-stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        title: 'Cảnh báo vật tư thấp',
        message: `Vật tư ${summary.materialName} trong phòng ${summary.roomName} đang ở mức thấp`,
        timestamp: new Date(),
        isRead: false,
        data: summary
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    const handleTransactionUpdate = (transaction: any) => {
      const notification: Notification = {
        id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'success',
        title: 'Cập nhật giao dịch',
        message: `Giao dịch ${transaction.id} đã được cập nhật`,
        timestamp: new Date(),
        isRead: false,
        data: transaction
      };
      globalNotifications = [notification, ...globalNotifications.slice(0, 49)];
      notifyGlobalListeners();
    };

    // Start SignalR connection and setup listeners
    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        setIsConnected(true);
        
        // Schedule events - using the correct event names from SignalR service
        signalRService.on('scheduleUpdate', handleScheduleUpdate);
        signalRService.on('scheduleDelete', handleScheduleDelete);
        signalRService.on('scheduleChangeRequest', handleScheduleChangeRequest);
        
        // Doctor profile events
        signalRService.on('doctorProfileUpdate', handleDoctorProfileUpdate);
        signalRService.on('doctorProfileDelete', handleDoctorProfileDelete);
        
        // Room events
        signalRService.on('examinationRoomUpdate', handleExaminationRoomUpdate);
        signalRService.on('examinationRoomDelete', handleExaminationRoomDelete);
        signalRService.on('laboratoryRoomUpdate', handleLaboratoryRoomUpdate);
        signalRService.on('laboratoryRoomDelete', handleLaboratoryRoomDelete);
        
        // Service events
        signalRService.on('serviceUpdate', handleServiceUpdate);
        signalRService.on('serviceDelete', handleServiceDelete);
        
        // Supplier events
        signalRService.on('supplierUpdate', handleSupplierUpdate);
        signalRService.on('supplierDelete', handleSupplierDelete);
        
        // Medicine events
        signalRService.on('medicineUpdate', handleMedicineUpdate);
        signalRService.on('medicineDelete', handleMedicineDelete);
        
        // Category events
        signalRService.on('categoryUpdate', handleCategoryUpdate);
        signalRService.on('categoryDelete', handleCategoryDelete);
        
        // Special events
        signalRService.on('lowStockAlert', handleLowStockAlert);
        signalRService.on('transactionUpdate', handleTransactionUpdate);
        
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
        setIsConnected(false);
      }
    };

    initializeSignalR();

    // Cleanup - only when component unmounts and no other instances exist
    return () => {
      // Only cleanup if this is the last instance
      if (globalListeners.size === 1) {
        signalRService.off('scheduleUpdate', handleScheduleUpdate);
        signalRService.off('scheduleDelete', handleScheduleDelete);
        signalRService.off('scheduleChangeRequest', handleScheduleChangeRequest);
        signalRService.off('doctorProfileUpdate', handleDoctorProfileUpdate);
        signalRService.off('doctorProfileDelete', handleDoctorProfileDelete);
        signalRService.off('examinationRoomUpdate', handleExaminationRoomUpdate);
        signalRService.off('examinationRoomDelete', handleExaminationRoomDelete);
        signalRService.off('laboratoryRoomUpdate', handleLaboratoryRoomUpdate);
        signalRService.off('laboratoryRoomDelete', handleLaboratoryRoomDelete);
        signalRService.off('serviceUpdate', handleServiceUpdate);
        signalRService.off('serviceDelete', handleServiceDelete);
        signalRService.off('supplierUpdate', handleSupplierUpdate);
        signalRService.off('supplierDelete', handleSupplierDelete);
        signalRService.off('medicineUpdate', handleMedicineUpdate);
        signalRService.off('medicineDelete', handleMedicineDelete);
        signalRService.off('categoryUpdate', handleCategoryUpdate);
        signalRService.off('categoryDelete', handleCategoryDelete);
        signalRService.off('lowStockAlert', handleLowStockAlert);
        signalRService.off('transactionUpdate', handleTransactionUpdate);
        isSignalRInitialized = false;
      }
    };
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    globalListeners.add(updateLocalState);
    return () => {
      globalListeners.delete(updateLocalState);
    };
  }, [updateLocalState]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification
  };
};

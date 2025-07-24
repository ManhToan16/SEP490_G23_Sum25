import { useEffect, useCallback, useRef } from 'react';
import { useSchedule } from './useSchedule';
import { useToast } from '@/shared/components/ui/use-toast';
import signalRService from '@/shared/services/signalRService';

// Debounce map to prevent duplicate toasts
const recentToasts = new Map<string, number>();
const TOAST_DEBOUNCE_TIME = 2000; // 2 seconds

export const useRealtimeSchedule = (currentRole: string, fromDate: string, toDate: string) => {
  const { loadSchedulesByRole } = useSchedule();
  const { toast } = useToast();
  const callbacksRef = useRef<{
    scheduleUpdate?: Function;
    scheduleDelete?: Function;
    scheduleChangeRequest?: Function;
  }>({});
  
  // Store current params to avoid unnecessary re-initializations
  const currentParamsRef = useRef<string>('');

  // Helper function to show toast with debounce
  const showToastWithDebounce = useCallback((key: string, toastConfig: any) => {
    const now = Date.now();
    const lastToast = recentToasts.get(key);
    
    if (!lastToast || now - lastToast > TOAST_DEBOUNCE_TIME) {
      recentToasts.set(key, now);
      toast(toastConfig);
      
      // Clean up old entries
      setTimeout(() => {
        recentToasts.delete(key);
      }, TOAST_DEBOUNCE_TIME);
    }
  }, [toast]);

  // Handle schedule update from SignalR (both create and update)
  const handleScheduleUpdate = useCallback((schedule: any) => {
    console.log('Realtime schedule update:', schedule);
    console.log('🔍 Debug - Current role:', currentRole);
    console.log('🔍 Debug - Schedule role:', schedule.role || schedule.Role);
    console.log('🔍 Debug - Date range:', { fromDate, toDate });
    console.log('🔍 Debug - Schedule date:', schedule.date || schedule.Date);
    
    // Check if the updated schedule belongs to current view
    // BE returns ScheduleResponseDTO with Role field
    const scheduleRole = schedule.role || schedule.Role;
    const roleMatches = scheduleRole === currentRole;
    console.log('🔍 Debug - Role matches:', roleMatches);
    
    if (roleMatches) {
      // Parse date from BE format (dd/MM/yyyy) to compare
      let scheduleDate: Date;
      try {
        const dateString = schedule.Date || schedule.date;
        console.log('🔍 Debug - Raw date string:', dateString);
        
        if (dateString && typeof dateString === 'string' && dateString.includes('/')) {
          // BE format: "dd/MM/yyyy"
          const dateParts = dateString.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2]);
            scheduleDate = new Date(year, month, day);
            console.log('🔍 Debug - Parsed parts:', { day, month: month + 1, year });
          } else {
            console.error('Invalid date parts:', dateParts);
            scheduleDate = new Date();
          }
        } else if (dateString) {
          // Try to parse as ISO string or other format
          scheduleDate = new Date(dateString);
        } else {
          scheduleDate = new Date();
        }
        console.log('🔍 Debug - Parsed schedule date:', scheduleDate);
        console.log('🔍 Debug - Is valid date:', !isNaN(scheduleDate.getTime()));
      } catch (error) {
        console.error('Error parsing schedule date:', error);
        scheduleDate = new Date();
      }
      
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      // Check if scheduleDate is valid before comparison
      if (isNaN(scheduleDate.getTime())) {
        console.error('❌ Invalid schedule date - skipping refresh');
        return;
      }
      
      console.log('🔍 Debug - Date comparison:', {
        scheduleDate: scheduleDate.toISOString(),
        fromDate: fromDateObj.toISOString(),
        toDate: toDateObj.toISOString(),
        inRange: scheduleDate >= fromDateObj && scheduleDate <= toDateObj
      });
      
      if (scheduleDate >= fromDateObj && scheduleDate <= toDateObj) {
        console.log('✅ Conditions met - refreshing data and showing toast');
        
        // Refresh the current view
        loadSchedulesByRole(currentRole, fromDate, toDate);
        
        // Show toast with debounce to prevent duplicates
        const toastKey = `schedule-update-${schedule.Id || schedule.id || 'unknown'}`;
        showToastWithDebounce(toastKey, {
          title: "Cập nhật lịch làm việc",
          description: `Lịch của ${schedule.UserName || schedule.userName || 'nhân viên'} đã được cập nhật`,
          variant: "success",
        });
      } else {
        console.log('❌ Date not in range - skipping refresh');
      }
    } else {
      console.log('❌ Role does not match - skipping refresh');
    }
  }, [currentRole, fromDate, toDate, loadSchedulesByRole, showToastWithDebounce]);

  // Handle schedule delete from SignalR
  const handleScheduleDelete = useCallback((scheduleId: string) => {
    console.log('Realtime schedule delete:', scheduleId);
    
    // Always refresh when a schedule is deleted as we don't know which role it belonged to
    loadSchedulesByRole(currentRole, fromDate, toDate);
    
    // Show toast with debounce to prevent duplicates
    const toastKey = `schedule-delete-${scheduleId}`;
    showToastWithDebounce(toastKey, {
      title: "Xóa lịch làm việc",
      description: "Một lịch làm việc đã được xóa",
      variant: "warning",
    });
  }, [currentRole, fromDate, toDate, loadSchedulesByRole, showToastWithDebounce]);

  // Handle schedule change request from SignalR
  const handleScheduleChangeRequest = useCallback((changeRequest: any) => {
    console.log('Realtime schedule change request:', changeRequest);
    
    // Show toast with debounce to prevent duplicates
    const toastKey = `schedule-change-${changeRequest.Id || changeRequest.id || Date.now()}`;
    showToastWithDebounce(toastKey, {
      title: "Yêu cầu thay đổi lịch",
      description: `Có yêu cầu thay đổi lịch làm việc mới`,
      variant: "info",
    });
  }, [showToastWithDebounce]);

  // Setup SignalR connection and event listeners (only once)
  useEffect(() => {
    let isSubscribed = true;
    
    const initializeSignalR = async () => {
      try {
        // Start connection
        await signalRService.startConnection();
        
        if (!isSubscribed) return; // Component unmounted during connection
        
        // Setup event listeners (only once)
        signalRService.on("scheduleUpdate", (schedule: any) => {
          if (isSubscribed) {
            callbacksRef.current.scheduleUpdate?.(schedule);
          }
        });
        
        signalRService.on("scheduleDelete", (scheduleId: string) => {
          if (isSubscribed) {
            callbacksRef.current.scheduleDelete?.(scheduleId);
          }
        });

        signalRService.on("scheduleChangeRequest", (changeRequest: any) => {
          if (isSubscribed) {
            callbacksRef.current.scheduleChangeRequest?.(changeRequest);
          }
        });
        
        console.log("SignalR initialized for schedule management");
      } catch (error) {
        console.error("Failed to initialize SignalR:", error);
      }
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      isSubscribed = false;
      signalRService.off("scheduleUpdate", callbacksRef.current.scheduleUpdate!);
      signalRService.off("scheduleDelete", callbacksRef.current.scheduleDelete!);
      signalRService.off("scheduleChangeRequest", callbacksRef.current.scheduleChangeRequest!);
    };
  }, []); // Empty dependency array - only run once

  // Update callbacks when role/date params change (but don't re-initialize connection)
  useEffect(() => {
    const paramsKey = `${currentRole}-${fromDate}-${toDate}`;
    
    // Only update callbacks if params actually changed
    if (currentParamsRef.current !== paramsKey) {
      console.log('📅 Updating realtime callbacks for:', paramsKey);
      
      callbacksRef.current.scheduleUpdate = handleScheduleUpdate;
      callbacksRef.current.scheduleDelete = handleScheduleDelete;
      callbacksRef.current.scheduleChangeRequest = handleScheduleChangeRequest;
      
      currentParamsRef.current = paramsKey;
    }
  }, [currentRole, fromDate, toDate, handleScheduleUpdate, handleScheduleDelete, handleScheduleChangeRequest]);

  // No return value needed - this hook just sets up realtime listeners
}; 
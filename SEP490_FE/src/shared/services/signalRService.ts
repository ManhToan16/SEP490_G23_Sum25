// SignalR Service - Real implementation with fallback to mock
import * as signalR from "@microsoft/signalr";

interface SignalRConnection {
  state: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  on(methodName: string, callback: (...args: any[]) => void): void;
  off(methodName: string, callback: (...args: any[]) => void): void;
  onreconnecting(callback: (error?: any) => void): void;
  onreconnected(callback: (connectionId?: any) => void): void;
  onclose(callback: (error?: Error) => void): void;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      // Get API URL from environment - BE chạy trên port 5050
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://70.153.24.53:5050/api';
      const baseUrl = apiUrl.replace('/api', '');
      const hubUrl = `${baseUrl}/khanhanHub`;
      
      // Real SignalR implementation with improved error handling
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          // BE sử dụng AllowAllOrigins nên không cần credentials
          withCredentials: false,
          // Try LongPolling first, then WebSockets as fallback
          transport: signalR.HttpTransportType.LongPolling | signalR.HttpTransportType.WebSockets,
          skipNegotiation: false,
          // Add timeout settings
          timeout: 30000,
          // Add headers if needed
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
    } catch (error) {
      throw error;
    }

    if (this.connection) {
      // Setup event handlers
      this.connection.onreconnecting((error) => {
        this.reconnectAttempts++;
      });

      this.connection.onreconnected((connectionId) => {
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error?: Error) => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => this.startConnection(), 5000);
        }
      });
    }
  }

  async startConnection() {
    if (!this.connection) {
      return;
    }
    
    try {
      if (this.connection.state === signalR.HubConnectionState.Disconnected) {
        await this.connection.start();
        
        this.setupEventListeners();
        this.reconnectAttempts = 0;
      }
    } catch (error: any) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const retryDelay = Math.min(5000 * this.reconnectAttempts, 30000); // Exponential backoff
        setTimeout(() => this.startConnection(), retryDelay);
      }
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Silent error handling
      }
    }
  }

  private setupEventListeners() {
    if (!this.connection) return;

    // Schedule events - matching BE exactly
    // BE sends both CREATE and UPDATE via ReceiveScheduleUpdate
    this.connection.on("ReceiveScheduleUpdate", (schedule) => {
      this.notifyListeners("scheduleUpdate", schedule);
    });

    this.connection.on("ReceiveScheduleDelete", (scheduleId) => {
      this.notifyListeners("scheduleDelete", scheduleId);
    });

    // Schedule change requests
    this.connection.on("ReceiveScheduleChangeRequest", (changeRequest) => {
      this.notifyListeners("scheduleChangeRequest", changeRequest);
    });

    // Other realtime events from BE
    this.connection.on("ReceiveDoctorProfileUpdate", (doctorProfile) => {
      this.notifyListeners("doctorProfileUpdate", doctorProfile);
    });

    this.connection.on("ReceiveDoctorProfileDelete", (doctorProfileId) => {
      this.notifyListeners("doctorProfileDelete", doctorProfileId);
    });

    this.connection.on("ReceiveExaminationRoomUpdate", (room) => {
      this.notifyListeners("examinationRoomUpdate", room);
    });

    this.connection.on("ReceiveExaminationRoomDelete", (roomId) => {
      this.notifyListeners("examinationRoomDelete", roomId);
    });

    this.connection.on("ReceiveLaboratoryRoomUpdate", (room) => {
      this.notifyListeners("laboratoryRoomUpdate", room);
    });

    this.connection.on("ReceiveLaboratoryRoomDelete", (roomId) => {
      this.notifyListeners("laboratoryRoomDelete", roomId);
    });

    this.connection.on("ReceiveServiceUpdate", (service) => {
      this.notifyListeners("serviceUpdate", service);
    });

    this.connection.on("ReceiveServiceDelete", (serviceId) => {
      this.notifyListeners("serviceDelete", serviceId);
    });

    this.connection.on("ReceiveSupplierUpdate", (supplier) => {
      this.notifyListeners("supplierUpdate", supplier);
    });

    this.connection.on("ReceiveSupplierDelete", (supplierId) => {
      this.notifyListeners("supplierDelete", supplierId);
    });

    this.connection.on("ReceiveMedicineUpdate", (medicine) => {
      this.notifyListeners("medicineUpdate", medicine);
    });

    this.connection.on("ReceiveMedicineDelete", (medicineId) => {
      this.notifyListeners("medicineDelete", medicineId);
    });

    this.connection.on("ReceiveCategoryUpdate", (category) => {
      this.notifyListeners("categoryUpdate", category);
    });

    this.connection.on("ReceiveCategoryDelete", (categoryId) => {
      this.notifyListeners("categoryDelete", categoryId);
    });

    this.connection.on("ReceiveLowStockAlert", (summary) => {
      this.notifyListeners("lowStockAlert", summary);
    });

    this.connection.on("ReceiveTransactionUpdate", (transaction) => {
      this.notifyListeners("transactionUpdate", transaction);
    });

    // Appointment events - matching BE exactly
    this.connection.on("AppointmentChanged", (appointmentData) => {
      this.notifyListeners("appointmentChanged", appointmentData);
    });

    // Visit events - matching BE exactly
    this.connection.on("VisitChanged", (visitData) => {
      this.notifyListeners("visitChanged", visitData);
    });

    // Assignment events - matching BE exactly
    this.connection.on("AssignmentChanged", (assignmentData) => {
      this.notifyListeners("assignmentChanged", assignmentData);
    });

    // Debug: Listen to ALL events to see what backend is sending
    this.connection.onreconnected(() => {
      // Re-setup listeners on reconnect
    });

    // Listen for potential alternative event names that backend might use
    const potentialEventNames = [
      "VisitChanged", 
      "visitChanged", 
      "VisitCreated", 
      "VisitUpdated",
      "visit-changed",
      "visit_changed",
      "onVisitChanged",
      "ReceiveVisitUpdate",
      "ReceiveVisitChanged"
    ];

    potentialEventNames.forEach(eventName => {
      this.connection.on(eventName, (data) => {
        // If it's not the main VisitChanged event, also notify our listeners
        if (eventName !== "VisitChanged") {
          this.notifyListeners("visitChanged", data);
        }
      });
    });
  }

  // Subscribe to events
  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  // Unsubscribe from events
  off(eventName: string, callback: (...args: any[]) => void) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(eventName: string, data: any) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Silent error handling
        }
      });
    }
  }

  getConnectionState() {
    if (this.connection) {
      return signalR.HubConnectionState[this.connection.state];
    }
    return "Disconnected";
  }

  isConnected() {
    if (this.connection) {
      return this.connection.state === signalR.HubConnectionState.Connected;
    }
    return false;
  }

  // Get connection info for debugging
  getConnectionInfo() {
    return {
      state: this.getConnectionState(),
      isConnected: this.isConnected(),
      listenersCount: this.listeners.size,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Manual reconnect method
  async reconnect() {
    if (this.connection) {
      await this.stopConnection();
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.reconnectAttempts = 0; // Reset attempts for manual reconnect
      await this.startConnection();
    }
  }

  // Test connection method
  async testConnection() {
    if (this.connection) {
      if (!this.isConnected()) {
        await this.startConnection();
      }
    } else {
      this.initializeConnection();
      await this.startConnection();
    }
  }
}

// Singleton instance
export const signalRService = new SignalRService();
export default signalRService; 
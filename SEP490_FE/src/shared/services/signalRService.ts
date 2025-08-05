// SignalR Service - Real implementation with fallback to mock
import * as signalR from "@microsoft/signalr";

interface SignalRConnection {
  state: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  on(methodName: string, callback: Function): void;
  off(methodName: string, callback: Function): void;
  onreconnecting(callback: (error?: any) => void): void;
  onreconnected(callback: (connectionId?: any) => void): void;
  onclose(callback: (error?: Error) => void): void;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      // Get API URL from environment - BE chạy trên port 5050
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'https://be.khanhanclinic.io.vn/api';
      const baseUrl = apiUrl.replace('/api', '');
      const hubUrl = `${baseUrl}/khanhanHub`;
      console.log('Initializing SignalR connection to:', hubUrl);
      
      // Real SignalR implementation
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          // BE sử dụng AllowAllOrigins nên không cần credentials
          withCredentials: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
      console.log('SignalR connection builder created');
      
    } catch (error) {
      console.error("SignalR initialization failed:", error);
      throw error;
    }

    if (this.connection) {
      // Setup event handlers
      this.connection.onreconnecting((error) => {
        console.log("SignalR: Reconnecting...", error);
        this.reconnectAttempts++;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR: Reconnected with connectionId:", connectionId);
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error?: Error) => {
        console.log("SignalR: Connection closed", error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Attempting manual reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.startConnection(), 5000);
        }
      });
    }
  }

  async startConnection() {
    if (!this.connection) return;
    
    try {
      if (this.connection.state === signalR.HubConnectionState.Disconnected) {
        console.log("Starting SignalR connection...");
        await this.connection.start();
        console.log("✅ SignalR: Connected successfully!");
        console.log("Connection ID:", (this.connection as any).connectionId);
        this.setupEventListeners();
        this.reconnectAttempts = 0;
      } else {
        console.log("SignalR already connected, state:", signalR.HubConnectionState[this.connection.state]);
      }
    } catch (error) {
      console.error("❌ SignalR: Connection failed", error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Retrying connection in 5 seconds... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.startConnection(), 5000);
      }
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR: Connection stopped gracefully");
      } catch (error) {
        console.error("Error stopping SignalR connection:", error);
      }
    }
  }

  private setupEventListeners() {
    if (!this.connection) return;

    console.log("Setting up SignalR event listeners...");

    // Schedule events - matching BE exactly
    // BE sends both CREATE and UPDATE via ReceiveScheduleUpdate
    this.connection.on("ReceiveScheduleUpdate", (schedule) => {
      console.log("📅 Received schedule update (create/update):", schedule);
      console.log("📅 Current listeners for scheduleUpdate:", this.listeners.get("scheduleUpdate")?.length || 0);
      this.notifyListeners("scheduleUpdate", schedule);
    });

    this.connection.on("ReceiveScheduleDelete", (scheduleId) => {
      console.log("🗑️ Received schedule delete:", scheduleId);
      console.log("🗑️ Current listeners for scheduleDelete:", this.listeners.get("scheduleDelete")?.length || 0);
      this.notifyListeners("scheduleDelete", scheduleId);
    });

    // Schedule change requests
    this.connection.on("ReceiveScheduleChangeRequest", (changeRequest) => {
      console.log("🔄 Received schedule change request:", changeRequest);
      this.notifyListeners("scheduleChangeRequest", changeRequest);
    });

    // Other realtime events from BE
    this.connection.on("ReceiveDoctorProfileUpdate", (doctorProfile) => {
      console.log("👨‍⚕️ Received doctor profile update:", doctorProfile);
      this.notifyListeners("doctorProfileUpdate", doctorProfile);
    });

    this.connection.on("ReceiveDoctorProfileDelete", (doctorProfileId) => {
      console.log("👨‍⚕️ Received doctor profile delete:", doctorProfileId);
      this.notifyListeners("doctorProfileDelete", doctorProfileId);
    });

    this.connection.on("ReceiveExaminationRoomUpdate", (room) => {
      console.log("🏥 Received examination room update:", room);
      this.notifyListeners("examinationRoomUpdate", room);
    });

    this.connection.on("ReceiveExaminationRoomDelete", (roomId) => {
      console.log("🏥 Received examination room delete:", roomId);
      this.notifyListeners("examinationRoomDelete", roomId);
    });

    this.connection.on("ReceiveLaboratoryRoomUpdate", (room) => {
      console.log("🧪 Received laboratory room update:", room);
      this.notifyListeners("laboratoryRoomUpdate", room);
    });

    this.connection.on("ReceiveLaboratoryRoomDelete", (roomId) => {
      console.log("🧪 Received laboratory room delete:", roomId);
      this.notifyListeners("laboratoryRoomDelete", roomId);
    });

    this.connection.on("ReceiveServiceUpdate", (service) => {
      console.log("🔧 Received service update:", service);
      this.notifyListeners("serviceUpdate", service);
    });

    this.connection.on("ReceiveServiceDelete", (serviceId) => {
      console.log("🔧 Received service delete:", serviceId);
      this.notifyListeners("serviceDelete", serviceId);
    });

    this.connection.on("ReceiveSupplierUpdate", (supplier) => {
      console.log("🏪 Received supplier update:", supplier);
      this.notifyListeners("supplierUpdate", supplier);
    });

    this.connection.on("ReceiveSupplierDelete", (supplierId) => {
      console.log("🏪 Received supplier delete:", supplierId);
      this.notifyListeners("supplierDelete", supplierId);
    });

    this.connection.on("ReceiveMedicineUpdate", (medicine) => {
      console.log("💊 Received medicine update:", medicine);
      this.notifyListeners("medicineUpdate", medicine);
    });

    this.connection.on("ReceiveMedicineDelete", (medicineId) => {
      console.log("💊 Received medicine delete:", medicineId);
      this.notifyListeners("medicineDelete", medicineId);
    });

    this.connection.on("ReceiveCategoryUpdate", (category) => {
      console.log("📂 Received category update:", category);
      this.notifyListeners("categoryUpdate", category);
    });

    this.connection.on("ReceiveCategoryDelete", (categoryId) => {
      console.log("📂 Received category delete:", categoryId);
      this.notifyListeners("categoryDelete", categoryId);
    });

    this.connection.on("ReceiveLowStockAlert", (summary) => {
      console.log("⚠️ Received low stock alert:", summary);
      this.notifyListeners("lowStockAlert", summary);
    });

    this.connection.on("ReceiveTransactionUpdate", (transaction) => {
      console.log("💰 Received transaction update:", transaction);
      this.notifyListeners("transactionUpdate", transaction);
    });

    console.log("✅ SignalR event listeners setup completed");
  }

  // Subscribe to events
  on(eventName: string, callback: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  // Unsubscribe from events
  off(eventName: string, callback: Function) {
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
          console.error(`Error in SignalR listener for ${eventName}:`, error);
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
    console.log("Manual reconnect requested...");
    if (this.connection) {
      await this.stopConnection();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.startConnection();
    }
  }
}

// Singleton instance
export const signalRService = new SignalRService();
export default signalRService; 
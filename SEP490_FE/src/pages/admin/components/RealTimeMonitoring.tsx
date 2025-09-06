import React, { useState, useEffect } from "react";
import { adminService } from "@/shared/services/adminService";
import {
  Users,
  Clock,
  Building,
  Activity,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface RealTimeData {
  patientQueue: {
    waitingForCheckIn: number;
    inExamination: number;
    inLaboratory: number;
    completed: number;
  };
  roomStatus: {
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    totalRooms: number;
  };
  staffOnline: {
    onlineDoctors: number;
    onlineNurses: number;
    onlineTechnicians: number;
    onlineReceptionists: number;
  };
  systemStatus: {
    server: "online" | "offline";
    database: "online" | "offline";
    api: "online" | "offline";
    lastUpdate: string;
  };
}

const RealTimeMonitoring: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTimeData();
    // Poll every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async () => {
    try {
      const roomRes = await adminService.getRoomUtilization();

      setRealTimeData({
        patientQueue: {
          waitingForCheckIn: 5,
          inExamination: 3,
          inLaboratory: 2,
          completed: 12,
        },
        roomStatus: {
          availableRooms: roomRes.availableRooms || 0,
          occupiedRooms: roomRes.occupiedRooms || 0,
          maintenanceRooms: roomRes.maintenanceRooms || 0,
          totalRooms: roomRes.totalRooms || 0,
        },
        staffOnline: {
          onlineDoctors: 2,
          onlineNurses: 3,
          onlineTechnicians: 1,
          onlineReceptionists: 1,
        },
        systemStatus: {
          server: "online",
          database: "online",
          api: "online",
          lastUpdate: new Date().toLocaleTimeString("vi-VN"),
        },
      });
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      // Mock data for demo
      // setRealTimeData({
      //   patientQueue: {
      //     waitingForCheckIn: 5,
      //     inExamination: 3,
      //     inLaboratory: 2,
      //     completed: 12,
      //   },
      //   roomStatus: {
      //     availableRooms: 3,
      //     occupiedRooms: 2,
      //     maintenanceRooms: 1,
      //     totalRooms: 6,
      //   },
      //   staffOnline: {
      //     onlineDoctors: 2,
      //     onlineNurses: 3,
      //     onlineTechnicians: 1,
      //     onlineReceptionists: 1,
      //   },
      //   systemStatus: {
      //     server: "online",
      //     database: "online",
      //     api: "online",
      //     lastUpdate: new Date().toLocaleTimeString("vi-VN"),
      //   },
      // });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: "online" | "offline") => {
    return status === "online" ? (
      <CheckCircle className="text-green-500" size={16} />
    ) : (
      <AlertCircle className="text-red-500" size={16} />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue"></div>
      </div>
    );
  }

  if (!realTimeData) {
    return <div>Không có dữ liệu real-time</div>;
  }

  return (
    <div className="space-y-6">
      {/* Patient Queue */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-clinic-navy">
            Hàng chờ bệnh nhân
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>Cập nhật: {realTimeData.systemStatus.lastUpdate}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {realTimeData.patientQueue.waitingForCheckIn}
            </div>
            <div className="text-sm text-gray-600">Chờ check-in</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {realTimeData.patientQueue.inExamination}
            </div>
            <div className="text-sm text-gray-600">Đang khám</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {realTimeData.patientQueue.inLaboratory}
            </div>
            <div className="text-sm text-gray-600">Xét nghiệm</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {realTimeData.patientQueue.completed}
            </div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="clinic-card">
        <h3 className="text-lg font-semibold text-clinic-navy mb-4">
          Trạng thái phòng khám
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Building className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-2xl font-bold text-green-600">
              {realTimeData.roomStatus.availableRooms}
            </div>
            <div className="text-sm text-gray-600">Phòng trống</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-2xl font-bold text-blue-600">
              {realTimeData.roomStatus.occupiedRooms}
            </div>
            <div className="text-sm text-gray-600">Đang sử dụng</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <AlertCircle className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="text-2xl font-bold text-orange-600">
              {realTimeData.roomStatus.maintenanceRooms}
            </div>
            <div className="text-sm text-gray-600">Bảo trì</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Tổng số phòng: {realTimeData.roomStatus.totalRooms}
          </div>
          <div className="text-sm text-gray-600">
            Tỷ lệ sử dụng:{" "}
            {realTimeData.roomStatus.totalRooms > 0
              ? Math.round(
                  (realTimeData.roomStatus.occupiedRooms /
                    realTimeData.roomStatus.totalRooms) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Staff Online */}
      <div className="clinic-card">
        <h3 className="text-lg font-semibold text-clinic-navy mb-4">
          Nhân viên online
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="mx-auto mb-2 text-blue-600" size={20} />
            <div className="text-xl font-bold text-blue-600">
              {realTimeData.staffOnline.onlineDoctors}
            </div>
            <div className="text-sm text-gray-600">Bác sĩ</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="mx-auto mb-2 text-green-600" size={20} />
            <div className="text-xl font-bold text-green-600">
              {realTimeData.staffOnline.onlineNurses}
            </div>
            <div className="text-sm text-gray-600">Y tá</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users className="mx-auto mb-2 text-purple-600" size={20} />
            <div className="text-xl font-bold text-purple-600">
              {realTimeData.staffOnline.onlineTechnicians}
            </div>
            <div className="text-sm text-gray-600">Kỹ thuật viên</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Users className="mx-auto mb-2 text-orange-600" size={20} />
            <div className="text-xl font-bold text-orange-600">
              {realTimeData.staffOnline.onlineReceptionists}
            </div>
            <div className="text-sm text-gray-600">Lễ tân</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="clinic-card">
        <h3 className="text-lg font-semibold text-clinic-navy mb-4">
          Trạng thái hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(realTimeData.systemStatus.server)}
            <div>
              <div className="font-medium">Server</div>
              <div className="text-sm text-gray-600">
                {realTimeData.systemStatus.server === "online"
                  ? "Hoạt động bình thường"
                  : "Không kết nối"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(realTimeData.systemStatus.database)}
            <div>
              <div className="font-medium">Database</div>
              <div className="text-sm text-gray-600">
                {realTimeData.systemStatus.database === "online"
                  ? "Kết nối ổn định"
                  : "Lỗi kết nối"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(realTimeData.systemStatus.api)}
            <div>
              <div className="font-medium">API</div>
              <div className="text-sm text-gray-600">
                {realTimeData.systemStatus.api === "online"
                  ? "Phản hồi nhanh"
                  : "Phản hồi chậm"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;

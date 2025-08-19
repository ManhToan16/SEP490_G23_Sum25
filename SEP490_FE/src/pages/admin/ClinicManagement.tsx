import React, { useEffect, useState } from 'react';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { useToast } from '../../shared/components/ui/use-toast';
import RoomForm from '@/shared/components/common/RoomForm';
import { adminService } from '@/shared/services/adminService';

const ClinicManagement: React.FC = () => {
  const [showForm, setShowForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [rooms, setRooms] = useState<{ examination: any[]; laboratory: any[] }>({
    examination: [],
    laboratory: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [examinationData, laboratoryData] = await Promise.all([
          adminService.getExaminationRooms(),
          adminService.getLaboratoryRooms(),
        ]);
        setRooms({ examination: examinationData, laboratory: laboratoryData });
        console.log("rooms[roomType] =", rooms.examination);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const handleSaveRoom = async (roomType: string, roomData: any) => {
    try {
      if (editingItem) {
        const hasChanges =
          editingItem.name !== roomData.name ||
          editingItem.description !== roomData.description;

        if (!hasChanges) {
          setShowForm(null);
          setEditingItem(null);
          return;
        }

        let updatedRoom;
        if (roomType === 'examination') {
          updatedRoom = await adminService.updateExaminationRoom(editingItem.id, roomData);
        } else {
          updatedRoom = await adminService.updateLaboratoryRoom(editingItem.id, roomData);
        }

        const roomToUpdate = Array.isArray(updatedRoom) ? updatedRoom[0] : updatedRoom;
        setRooms(prev => ({
          ...prev,
          [roomType]: prev[roomType].map(room =>
            room.id === editingItem.id ? roomToUpdate : room
          ),
        }));
      } else {
        let createdRoom;
        if (roomType === 'examination') {
          createdRoom = await adminService.createExaminationRoom(roomData);
        } else {
          createdRoom = await adminService.createLaboratoryRoom(roomData);
        }

        setRooms(prev => ({
          ...prev,
          [roomType]: [...prev[roomType], createdRoom[0]],
        }));
      }

      setShowForm(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Lỗi khi lưu phòng:', error);
      throw error;
    }
  };

  const handleToggleRoom = async (
    roomType: 'examination' | 'laboratory',
    roomId: string,
    currentStatus: boolean
  ) => {
    try {
      await (
        roomType === 'examination'
          ? (currentStatus
            ? adminService.deactivateExaminationRoom(roomId)
            : adminService.activateExaminationRoom(roomId))
          : (currentStatus
            ? adminService.deactivateLaboratoryRoom(roomId)
            : adminService.activateLaboratoryRoom(roomId))
      );

      // 🔥 Không dùng response nữa, chỉ toggle trong state
      setRooms(prev => ({
        ...prev,
        [roomType]: prev[roomType].map(room =>
          room.id === roomId ? { ...room, isActive: !currentStatus } : room
        ),
      }));

      toast({
        title: currentStatus
          ? 'Phòng đã bị vô hiệu'
          : 'Phòng đã được kích hoạt',
      });
    } catch (error) {
      console.error('Lỗi khi toggle phòng:', error);
    }
  };

  if (showForm?.startsWith('room-')) {
    const roomType = showForm.split('-')[1];
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <RoomForm
            roomType={roomType}
            room={editingItem}
            onSave={(roomData) => handleSaveRoom(roomType, roomData)}
            onCancel={() => {
              setShowForm(null);
              setEditingItem(null);
            }}
          />
        </div>
      </div>
    );
  }

  const renderRoomList = (roomType: 'examination' | 'laboratory', title: string) => (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(`room-${roomType}`)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm Phòng
        </Button>
      </div>
      <div className="space-y-2">
        {rooms[roomType].map((room) => (
          <div key={room.id} className="flex justify-between items-center p-3 border rounded">
            <div className="flex items-center gap-3">
              <div className="font-medium">{room.name}</div>
              <span
                className={`text-sm px-2 py-1 rounded ${room.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {room.isActive ? 'Đang hoạt động' : 'Vô hiệu'}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="p-1"
                onClick={() => {
                  setEditingItem(room);
                  setShowForm(`room-${roomType}`);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`p-1 ${room.isActive ? 'text-red-600' : 'text-green-600'}`}
                onClick={() => handleToggleRoom(roomType, room.id, room.isActive)}
              >
                {room.isActive ? (
                  <XCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Quản lý phòng khám
        </h1>
        <p className="text-gray-600">Quản lý khoa phòng, dịch vụ và cơ sở vật chất</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {renderRoomList('examination', 'Phòng Khám Tổng Quát')}
        {renderRoomList('laboratory', 'Phòng Xét Nghiệm')}
      </div>
    </div>
  );
};

export default ClinicManagement;

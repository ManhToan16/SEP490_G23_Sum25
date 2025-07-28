import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { useToast } from '../../shared/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '../../shared/components/ui/alert-dialog';
import RoomForm from '@/shared/components/common/RoomForm';
import { adminService } from '@/shared/services/adminService';

const ClinicManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [rooms, setRooms] = useState({ examination: [], laboratory: [] });
  const [roomToDelete, setRoomToDelete] = useState<{ roomType: string, roomId: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [examinationData, laboratoryData] = await Promise.all([
          adminService.getExaminationRooms(),
          adminService.getLaboratoryRooms(),
        ]);
        setRooms({ examination: examinationData, laboratory: laboratoryData });
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleSaveRoom = async (roomType, roomData) => {
    try {
      console.log('roomType:', roomType);
      console.log('roomData:', roomData);

      if (editingItem) {
        const hasChanges =
          editingItem.name !== roomData.name ||
          editingItem.description !== roomData.description

        if (!hasChanges) {
          console.log('Không có thay đổi nào, đóng form');
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
          )
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

  const handleDeleteRoom = async (roomType: string, roomId: string) => {
    try {
      if (roomType === 'examination') {
        await adminService.deleteExaminationRoom(roomId);
      } else if (roomType === 'laboratory') {
        await adminService.deleteLaboratoryRoom(roomId);
      }

      setRooms(prev => ({
        ...prev,
        [roomType]: prev[roomType].filter(room => room.id !== roomId)
      }));
    } catch (error) {
      console.error('Lỗi khi xóa phòng:', error);
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
            onCancel={() => { setShowForm(null); setEditingItem(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
          Quản lý phòng khám
        </h1>
        <p className="text-gray-600">
          Quản lý khoa phòng, dịch vụ và cơ sở vật chất
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Examination Rooms */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Phòng Khám Tổng Quát</h3>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowForm('room-examination')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm Phòng
            </Button>
          </div>
          <div className="space-y-2">
            {rooms.examination.map((room) => (
              <div key={room.id} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{room.name}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-1"
                    onClick={() => {
                      setEditingItem(room);
                      setShowForm('room-examination');
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-1 text-red-600"
                    onClick={() => setRoomToDelete({ roomType: 'examination', roomId: room.id })}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Laboratory Rooms */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Phòng Xét Nghiệm</h3>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowForm('room-laboratory')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm Phòng
            </Button>
          </div>
          <div className="space-y-2">
            {rooms.laboratory.map((room) => (
              <div key={room.id} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{room.name}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-1"
                    onClick={() => {
                      setEditingItem(room);
                      setShowForm('room-laboratory');
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-1 text-red-600"
                    onClick={() => setRoomToDelete({ roomType: 'laboratory', roomId: room.id })}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alert Dialog for Delete Confirmation - FIX: Di chuyển ra ngoài để tránh duplicate */}
      <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá phòng này? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoomToDelete(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (roomToDelete) {
                  await handleDeleteRoom(roomToDelete.roomType, roomToDelete.roomId);
                  toast({ title: 'Xoá phòng thành công!' });
                  setRoomToDelete(null);
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClinicManagement;
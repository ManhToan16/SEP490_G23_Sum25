import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { adminService } from '@/shared/services/adminService';

const RoomForm = ({ roomType, room, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: room?.name || '',
        status: room?.status || 'available',
        description: room?.description || '',
        services: room?.services || []
    });
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({ name: '', price: '', description: '' });
    const [showAddService, setShowAddService] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [showEditService, setShowEditService] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const fetchServicesByRoom = async () => {
            if (room?.id && roomType === 'laboratory') {
                try {
                    const res = await adminService.getServicesByRoomId(room.id);
                    setServices(res);
                } catch (error) {
                    console.error('Lỗi khi tải dịch vụ theo phòng:', error);
                }
            }
        };

        fetchServicesByRoom();
    }, [room?.id, roomType]);

    const handleAddService = async () => {
        if (newService.name && newService.price && !isNaN(Number(newService.price))) {
            try {
                const created = await adminService.createService({
                    ...newService,
                    price: Number(newService.price),
                    laboratoryRoomId: room.id,
                });
                setServices(prev => [...prev, created[0]]);
                toast({ title: 'Thêm dịch vụ thành công' });
                setNewService({ name: '', price: '', description: '' });
                setShowAddService(false);
            } catch (error) {
                toast({ title: 'Thêm dịch vụ thất bại', variant: 'destructive' });
            }
        } else {
            toast({ title: 'Vui lòng nhập tên và giá tiền hợp lệ', variant: 'destructive' });
        }
    };

    const handleUpdateService = async () => {
        console.log("🔥 API UPDATE ĐƯỢC GỌI - handleUpdateService được thực thi");
        console.log("📝 Dữ liệu editingService:", editingService);

        if (editingService && editingService.name && editingService.price && !isNaN(Number(editingService.price))) {
            try {
                console.log("📡 Đang gọi API updateService với data:", {
                    id: editingService.id,
                    data: { ...editingService, price: Number(editingService.price) }
                });

                const updated = await adminService.updateService(editingService.id, {
                    ...editingService,
                    price: Number(editingService.price),
                });

                console.log("✅ API updateService thành công:", updated);
                setServices(prev => prev.map(s => (s.id === updated[0].id ? updated[0] : s)));
                toast({ title: 'Cập nhật dịch vụ thành công' });
                setEditingService(null);
                setShowEditService(false);
            } catch (error) {
                console.error('❌ Lỗi cập nhật dịch vụ:', error);
                toast({ title: 'Cập nhật dịch vụ thất bại', variant: 'destructive' });
            }
        } else {
            toast({ title: 'Vui lòng nhập tên và giá tiền hợp lệ', variant: 'destructive' });
        }
    };

    // FIX: Thêm preventDefault và stopPropagation
    const handleEditService = (e, service) => {
        e.preventDefault(); // Ngăn form submit
        e.stopPropagation(); // Ngăn event bubbling

        console.log("🖊️ NÚT SỬA ĐƯỢC CLICK - handleEditService được gọi");
        console.log("📄 Service data:", service);
        console.log("⚠️ Nếu thấy log API UPDATE ngay sau đây thì có bug!");

        setEditingService({
            ...service,
            price: String(service.price),
        });
        setShowEditService(true);

        console.log("✅ Đã set editingService và showEditService = true");
    };

    // FIX: Thêm preventDefault cho delete
    const handleDeleteService = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            try {
                await adminService.deleteService(id);
                toast({ title: 'Đã xóa dịch vụ' });
                setServices(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error('Lỗi xóa dịch vụ:', error);
                toast({ title: 'Xóa dịch vụ thất bại', variant: 'destructive' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            ...(roomType === 'laboratory' && { services }),
        };

        try {
            await onSave(dataToSave);
            toast({
                title: `${room ? 'Cập nhật' : 'Thêm'} phòng thành công!`,
                description: `Phòng đã được ${room ? 'cập nhật' : 'thêm'} vào hệ thống.`,
            });
        } catch (err: any) {
            console.error('Lỗi lưu phòng:', err);

            const apiError = err.response?.data;
            let errorMsg = 'Lưu phòng thất bại.';

            if (apiError?.errors && Array.isArray(apiError.errors)) {
                errorMsg = apiError.errors.map((e: any) => `${e.error}`).join(', ');
            } else if (apiError?.message) {
                errorMsg = apiError.message;
            }

            toast({
                title: 'Lưu phòng thất bại',
                description: errorMsg,
                variant: 'destructive',
            });
        }
    };

    // FIX: Thêm function hủy edit
    const handleCancelEdit = () => {
        setEditingService(null);
        setShowEditService(false);
    };

    // FIX: Thêm function hủy add
    const handleCancelAdd = () => {
        setShowAddService(false);
        setNewService({ name: '', price: '', description: '' });
    };

    const getRoomTypeDisplay = (type) => {
        switch (type) {
            case 'examination': return 'Phòng Khám Tổng Quát';
            case 'laboratory': return 'Phòng Xét Nghiệm';
            default: return type;
        }
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
                {room ? 'Chỉnh Sửa' : 'Thêm'} {getRoomTypeDisplay(roomType)}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Tên phòng *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên phòng"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả thiết bị, chức năng..."
                    />
                </div>

                {roomType === 'laboratory' && (
                    <div>
                        <Label>Dịch vụ phòng xét nghiệm</Label>

                        {room?.id ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddService(true)}
                            >
                                Thêm Dịch Vụ
                            </Button>
                        ) : (
                            <p className="text-sm text-gray-500 italic mt-2">
                                * Hãy tạo phòng trước khi thêm dịch vụ
                            </p>
                        )}

                        {showAddService && (
                            <div className="border p-4 mt-3 space-y-2 rounded">
                                <Input
                                    placeholder="Tên dịch vụ"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Giá tiền"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Mô tả"
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Button type="button" onClick={handleAddService}>
                                        Lưu
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={handleCancelAdd}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        )}

                        {showEditService && editingService && (
                            <div className="border p-4 mt-3 space-y-2 rounded bg-yellow-50">
                                <Input
                                    placeholder="Tên dịch vụ"
                                    value={editingService.name}
                                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Giá tiền"
                                    value={editingService.price}
                                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Mô tả"
                                    value={editingService.description || ''}
                                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Button type="button" onClick={handleUpdateService}>
                                        Cập nhật dịch vụ
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        )}

                        {services.map((s, idx) => (
                            <li key={idx} className="flex justify-between items-center p-2 border rounded mb-2">
                                <div>
                                    <div className="font-medium">{s.name}</div>
                                    <div className="text-sm text-gray-600">Giá: {s.price}₫</div>
                                    {s.description && (
                                        <div className="text-sm text-gray-500">{s.description}</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        type="button"
                                        onClick={(e) => handleEditService(e, s)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        type="button"
                                        onClick={(e) => handleDeleteService(e, s.id)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {room ? 'Cập Nhật' : 'Thêm Mới'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default RoomForm;
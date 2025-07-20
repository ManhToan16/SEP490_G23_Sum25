
import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Trash, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/components/ui/use-toast';
import UserForm from '@/pages/admin/UserForm.tsx';
import { adminService } from '@/shared/services/adminService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const AccountManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { toast } = useToast();

  // Load users from API
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getListUsers(1, 100); // Load more users
      setUsers(response.users);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (userType, userData) => {
    try {
      if (editingItem) {
        // Update existing user
        await adminService.updateUser(editingItem.id, userData);
        toast({
          title: "Thành công",
          description: "Cập nhật người dùng thành công"
        });
      } else {
        // Create new user
        await adminService.createUser(userData);
        toast({
          title: "Thành công", 
          description: "Tạo người dùng mới thành công"
        });
      }
      
      // Reload users
      loadUsers();
      setIsFormOpen(false);
      setEditingItem(null);
      setShowForm(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Có lỗi xảy ra"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể xóa người dùng"
      });
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      toast({
        title: "Thành công",
        description: "Kích hoạt người dùng thành công"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể kích hoạt người dùng"
      });
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await adminService.deactivateUser(userId);
      toast({
        title: "Thành công",
        description: "Vô hiệu hóa người dùng thành công"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể vô hiệu hóa người dùng"
      });
    }
  };

  const handleOpenForm = (userType, user = null) => {
    setShowForm(userType);
    setEditingItem(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setShowForm(null);
  };

  const getUserTypeDisplay = (role) => {
    switch (role) {
      case 'DOCTOR': return 'Bác Sĩ';
      case 'RECEPTIONIST': return 'Lễ Tân';
      case 'TECHNICIAN': return 'Kỹ Thuật Viên';
      case 'ADMIN': return 'Quản Trị Viên';
      case 'PATIENT': return 'Bệnh Nhân';
      default: return role;
    }
  };

  const getRoleType = (role) => {
    switch (role) {
      case 'doctors': return 'DOCTOR';
      case 'receptionists': return 'RECEPTIONIST';
      case 'technicians': return 'TECHNICIAN';
      case 'admins': return 'ADMIN';
      default: return 'PATIENT';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">
            Tạo và quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => loadUsers()}
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Làm mới
        </Button>
      </div>

      {/* Users Table */}
      <div className="grid grid-cols-3 gap-6">
        {/* Doctors */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Bác Sĩ</h3>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleOpenForm('user-doctors')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(user => user.role === 'DOCTOR').map((doctor) => (
                <div key={doctor.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{doctor.name}</div>
                    <div className="text-xs text-gray-500">{doctor.email}</div>
                    <div className="text-xs text-gray-400">{doctor.phoneNumber}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1"
                      onClick={() => handleOpenForm('user-doctors', doctor)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {doctor.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-orange-600"
                        onClick={() => handleDeactivateUser(doctor.id)}
                      >
                        Vô hiệu
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-green-600"
                        onClick={() => handleActivateUser(doctor.id)}
                      >
                        Kích hoạt
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1 text-red-600"
                      onClick={() => handleDeleteUser(doctor.id)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Receptionists */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Lễ Tân</h3>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleOpenForm('user-receptionists')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(user => user.role === 'RECEPTIONIST').map((receptionist) => (
                <div key={receptionist.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{receptionist.name}</div>
                    <div className="text-xs text-gray-500">{receptionist.email}</div>
                    <div className="text-xs text-gray-400">{receptionist.phoneNumber}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1"
                      onClick={() => handleOpenForm('user-receptionists', receptionist)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {receptionist.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-orange-600"
                        onClick={() => handleDeactivateUser(receptionist.id)}
                      >
                        Vô hiệu
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-green-600"
                        onClick={() => handleActivateUser(receptionist.id)}
                      >
                        Kích hoạt
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1 text-red-600"
                      onClick={() => handleDeleteUser(receptionist.id)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Technicians */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Kỹ Thuật Viên</h3>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleOpenForm('user-technicians')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(user => user.role === 'TECHNICIAN').map((technician) => (
                <div key={technician.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{technician.name}</div>
                    <div className="text-xs text-gray-500">{technician.email}</div>
                    <div className="text-xs text-gray-400">{technician.phoneNumber}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1"
                      onClick={() => handleOpenForm('user-technicians', technician)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {technician.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-orange-600"
                        onClick={() => handleDeactivateUser(technician.id)}
                      >
                        Vô hiệu
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 text-green-600"
                        onClick={() => handleActivateUser(technician.id)}
                      >
                        Kích hoạt
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1 text-red-600"
                      onClick={() => handleDeleteUser(technician.id)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* UserForm Modal */}
      {showForm && (
        <UserForm
          userType={showForm}
          user={editingItem}
          onSave={(userData) => handleSaveUser(showForm, userData)}
          onCancel={handleCloseForm}
          isOpen={isFormOpen}
        />
      )}
    </div>
  );
};

export default AccountManagement;

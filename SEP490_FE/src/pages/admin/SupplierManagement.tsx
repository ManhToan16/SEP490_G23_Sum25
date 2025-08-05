import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Search, Phone, Mail, MapPin } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';
import { useToast } from "@/shared/components/ui/use-toast";

interface Supplier {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const SupplierManagement: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [current, setCurrent] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    description: ''
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const suppliers = await adminService.getSupplierList();
      // Filter data locally
      let filteredData = suppliers;
      if (searchTerm) {
        filteredData = suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setData(filteredData);
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách nhà cung cấp";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Refetch data when search changes
    fetchData();
  }, [searchTerm]);

  const openAdd = () => {
    setModalType('add');
    setForm({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      description: ''
    });
    setCurrent(null);
    setShowModal(true);
  };

  const openEdit = (supplier: Supplier) => {
    setModalType('edit');
    setForm({
      name: supplier.name,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
      description: supplier.description
    });
    setCurrent(supplier);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrent(null);
    setForm({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      description: ''
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên nhà cung cấp là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (modalType === 'add') {
        await adminService.createSupplier(form);
        toast({
          title: "Thành công",
          description: "Đã tạo nhà cung cấp mới",
        });
      } else if (modalType === 'edit' && current) {
        await adminService.updateSupplier(current.id, form);
        toast({
          title: "Thành công",
          description: "Đã cập nhật nhà cung cấp",
        });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error('Error submitting supplier:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể lưu nhà cung cấp";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await adminService.deleteSupplier(deleteId);
      setDeleteId(null);
      fetchData();
      toast({
        title: "Thành công",
        description: "Đã xóa nhà cung cấp",
      });
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa nhà cung cấp";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-clinic-navy">Quản lý nhà cung cấp</h1>
        <button
          className="flex items-center px-4 py-2 bg-clinic-blue text-white rounded hover:bg-blue-700"
          onClick={openAdd}
        >
          <Plus size={18} className="mr-2" /> Thêm nhà cung cấp
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded shadow border p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả hoặc địa chỉ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-blue focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-clinic-navy">
              <th className="p-3 text-center w-16">STT</th>
              <th className="p-3 text-left w-1/5">Tên nhà cung cấp</th>
              <th className="p-3 text-left w-1/6">Liên hệ</th>
              <th className="p-3 text-left w-1/5">Địa chỉ</th>
              <th className="p-3 text-left w-1/4">Mô tả</th>
              <th className="p-3 text-left w-1/6">Ngày tạo</th>
              <th className="p-3 text-center w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-6">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-6">Không có dữ liệu</td></tr>
            ) : data.map((supplier, index) => (
              <tr key={supplier.id} className="border-b hover:bg-blue-50">
                <td className="p-3 text-center text-gray-600 font-medium">
                  {index + 1}
                </td>
                <td className="p-3 font-medium text-clinic-navy">{supplier.name}</td>
                <td className="p-3 text-gray-700">
                  <div className="space-y-1">
                    {supplier.phoneNumber && (
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="mr-1 text-gray-500" />
                        {supplier.phoneNumber}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center text-sm">
                        <Mail size={14} className="mr-1 text-gray-500" />
                        {supplier.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-gray-700">
                  {supplier.address && (
                    <div className="flex items-start text-sm">
                      <MapPin size={14} className="mr-1 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </td>
                <td className="p-3 text-gray-700">
                  <div className="line-clamp-3">{supplier.description}</div>
                </td>
                <td className="p-3 text-gray-600 text-sm">{supplier.createdAt}</td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" 
                      onClick={() => openEdit(supplier)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" 
                      onClick={() => setDeleteId(supplier.id)}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Hiển thị {data.length} trong tổng số {data.length} nhà cung cấp
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-clinic-navy">
              {modalType === 'add' ? 'Thêm nhà cung cấp' : 'Cập nhật nhà cung cấp'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Tên nhà cung cấp *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nhập tên nhà cung cấp"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Số điện thoại</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Nhập email"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Địa chỉ</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block mb-1 font-medium">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Nhập mô tả về nhà cung cấp"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-clinic-blue text-white hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
              >
                <Save size={16} className="inline mr-1" /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa nhà cung cấp này?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
                onClick={() => setDeleteId(null)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={saving}
              >
                <X size={16} className="inline mr-1" /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement; 
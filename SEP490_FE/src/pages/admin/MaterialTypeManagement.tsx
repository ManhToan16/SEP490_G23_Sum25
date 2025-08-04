
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Search } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';
import { useToast } from "@/shared/components/ui/use-toast";

const PAGE_SIZE = 10;

const MaterialTypeManagement: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [current, setCurrent] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getMaterialTypeList(pageNumber, PAGE_SIZE);
      // Filter data locally for now
      let filteredData = res.items;
      if (searchTerm) {
        filteredData = filteredData.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setData(filteredData);
      setTotalItems(res.totalItems); // Use totalItems from API
      setPage(res.pageNumber);
    } catch (error: any) {
      console.error('Error fetching material types:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách loại vật liệu";
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
    fetchData(page);
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    // Refetch data when search changes
    fetchData(1);
    setPage(1);
  }, [searchTerm]);

  const openAdd = () => {
    setModalType('add');
    setForm({ name: '', description: '' });
    setCurrent(null);
    setShowModal(true);
  };
  const openEdit = (item: any) => {
    setModalType('edit');
    setForm({ name: item.name, description: item.description });
    setCurrent(item);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setCurrent(null);
    setForm({ name: '', description: '' });
  };
  const handleSave = async () => {
    setSaving(true);
    try {
        if (modalType === 'add') {
          await adminService.createMaterialType(form);
        } else if (modalType === 'edit' && current) {
          await adminService.updateMaterialType(current.id, form);
        }
      
        toast({
          title: "Thành công",
          description: `${modalType === 'add' ? 'Thêm' : 'Cập nhật'} loại vật tư thành công`,
          variant: "success",
        });
      
        closeModal();
        fetchData(page);
      
    } catch (error: any) {
      console.error('Error submitting material type:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể lưu loại vật liệu";
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
      await adminService.deleteMaterialType(deleteId);
      setDeleteId(null);
      fetchData(page);
      toast({
        title: "Thành công",
        description: "Xóa loại vật tư thành công",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error deleting material type:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa loại vật liệu";
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-clinic-navy">Quản lý loại vật tư</h1>
        <button
          className="flex items-center px-4 py-2 bg-clinic-blue text-white rounded hover:bg-blue-700"
          onClick={openAdd}
        >
          <Plus size={18} className="mr-2" /> Thêm loại vật tư
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded shadow border p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
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
              <th className="p-3 text-left w-1/5">Tên loại vật tư</th>
              <th className="p-3 text-left w-1/4">Mô tả</th>
              <th className="p-3 text-left w-1/6">Ngày tạo</th>
              <th className="p-3 text-left w-1/6">Ngày cập nhật</th>
              <th className="p-3 text-center w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-6">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-6">Không có dữ liệu</td></tr>
            ) : data.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-blue-50">
                <td className="p-3 text-center text-gray-600 font-medium">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td className="p-3 font-medium text-clinic-navy">{item.name}</td>
                <td className="p-3 text-gray-700">{item.description}</td>
                <td className="p-3 text-gray-600 text-sm">{item.createdAt}</td>
                <td className="p-3 text-gray-600 text-sm">{item.updatedAt}</td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" 
                      onClick={() => openEdit(item)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" 
                      onClick={() => setDeleteId(item.id)}
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
      {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Hiển thị {data.length} trong tổng số {totalItems} loại vật tư
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </button>
            <span className="text-sm font-medium">Trang {page} / {Math.ceil(totalItems / PAGE_SIZE)}</span>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= Math.ceil(totalItems / PAGE_SIZE)}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-clinic-navy">{modalType === 'add' ? 'Thêm loại vật tư' : 'Cập nhật loại vật tư'}</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tên loại vật tư</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên loại vật tư"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Nhập mô tả"
                rows={3}
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
                disabled={saving || !form.name}
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
            <p className="mb-6">Bạn có chắc chắn muốn xóa loại vật tư này?</p>
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

export default MaterialTypeManagement;

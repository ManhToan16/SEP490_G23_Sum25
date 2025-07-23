
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';

const PAGE_SIZE = 10;

const MaterialTypeManagement: React.FC = () => {
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

  const fetchData = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getMaterialTypeList(pageNumber, PAGE_SIZE);
      setData(res.items);
      setTotalItems(res.totalItems);
      setPage(res.pageNumber);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line
  }, [page]);

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
      closeModal();
      fetchData(page);
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-clinic-navy">Quản lý loại vật tư</h1>
        <button
          className="flex items-center px-4 py-2 bg-clinic-blue text-white rounded hover:bg-blue-700"
          onClick={openAdd}
        >
          <Plus size={18} className="mr-2" /> Thêm loại vật tư
        </button>
      </div>
      <div className="bg-white rounded shadow border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-clinic-navy">
              <th className="p-3 text-left">Tên loại vật tư</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-center w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center p-6">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-6">Không có dữ liệu</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-blue-50">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-center">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => openEdit(item)}>
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:underline" onClick={() => setDeleteId(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center mt-4 space-x-2">
        <button
          className="px-3 py-1 rounded border bg-white hover:bg-gray-100"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Trước
        </button>
        <span className="text-sm">Trang {page} / {Math.ceil(totalItems / PAGE_SIZE) || 1}</span>
        <button
          className="px-3 py-1 rounded border bg-white hover:bg-gray-100"
          disabled={page >= Math.ceil(totalItems / PAGE_SIZE)}
          onClick={() => setPage(page + 1)}
        >
          Sau
        </button>
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

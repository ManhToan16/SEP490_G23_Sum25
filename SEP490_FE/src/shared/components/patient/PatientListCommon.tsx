import React, { useEffect, useState } from 'react';
import { Eye, Edit, Phone, Mail, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Modal from '@/shared/components/common/Modal';
import { adminService } from '@/shared/services/adminService';
import { toast } from '@/shared/components/ui/use-toast';

const PAGE_SIZE = 10;

const PatientListCommon: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchName, setSearchName] = useState('');

  // Modal Thêm mới
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    citizenId: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: 'Nam',
    address: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Modal Cập nhật
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    citizenId: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: 'Nam',
    address: '',
  });
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Modal Chi tiết bệnh nhân
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const handleViewDetail = (patient: any) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  // Fetch danh sách bệnh nhân
  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getPatientList({ pageNumber: page, pageSize: PAGE_SIZE, name: searchName });
      setPatients(Array.isArray(res.items) ? res.items : []);
      setTotalItems(res.totalItems || 0);
    } catch (err) {
      setPatients([]);
      setError('Lỗi tải dữ liệu bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, searchName]);

  // Thêm mới
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await adminService.createPatient(formData);
      toast({ title: 'Thành công', description: 'Tạo bệnh nhân mới thành công!', variant: 'success' });
      setShowModal(false);
      setFormData({ name: '', citizenId: '', phoneNumber: '', email: '', dateOfBirth: '', gender: 'Nam', address: '' });
      setPage(1);
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error?.response?.data?.message || error.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  // Cập nhật
  const handleEditClick = (patient: any) => {
    setEditFormData({
      id: patient.id,
      name: patient.name || '',
      citizenId: patient.citizenId || '',
      phoneNumber: patient.phoneNumber || '',
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
      gender: patient.gender || 'Nam',
      address: patient.address || '',
    });
    setShowEditModal(true);
  };
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormLoading(true);
    try {
      await adminService.updatePatient(editFormData.id, {
        name: editFormData.name,
        citizenId: editFormData.citizenId,
        phoneNumber: editFormData.phoneNumber,
        email: editFormData.email,
        dateOfBirth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        address: editFormData.address,
      });
      toast({ title: 'Thành công', description: 'Cập nhật bệnh nhân thành công!', variant: 'success' });
      setShowEditModal(false);
      setEditFormData({ id: '', name: '', citizenId: '', phoneNumber: '', email: '', dateOfBirth: '', gender: 'Nam', address: '' });
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error?.response?.data?.message || error.message, variant: 'destructive' });
    } finally {
      setEditFormLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Danh sách bệnh nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin bệnh nhân trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 clinic-button-primary"
        >
          <Plus size={20} />
          <span>Thêm bệnh nhân mới</span>
        </button>
      </div>
      {/* Patient List */}
      <div className="clinic-card mb-2">
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
          />
        </div>
      </div>
      <div className="clinic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Họ tên</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Liên hệ</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Ngày sinh</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Địa chỉ</th>
                <th className="text-left py-3 px-4 font-medium text-clinic-navy">Giới tính</th>
                <th className="text-center py-3 px-4 font-medium text-clinic-navy">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500">{error}</td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((patient: any) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-medium text-clinic-navy">{patient.name}</h4>
                        <p className="text-sm text-gray-600">CCCD: {patient.citizenId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone size={14} />
                          <span>{patient.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail size={14} />
                          <span>{patient.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : ''}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {patient.address}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.gender === 'Nam'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors" onClick={() => handleViewDetail(patient)}>
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors" onClick={() => handleEditClick(patient)}>
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-clinic-navy hover:bg-clinic-blue rounded-lg transition-colors">
                          <Phone size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy bệnh nhân nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm">
              Trang {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      {/* Modal Thêm mới */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-center text-clinic-navy">Thêm bệnh nhân mới</h2>
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Họ và tên *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập họ và tên" />
            </div>
            <div>
              <label className="block mb-1 font-medium">CCCD *</label>
              <input type="text" name="citizenId" value={formData.citizenId} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập số CCCD" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Số điện thoại *</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập email" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Ngày sinh *</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Giới tính *</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Địa chỉ</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập địa chỉ" />
            </div>
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100" disabled={formLoading}>Hủy</button>
              <button type="submit" className="px-6 py-2 bg-clinic-blue text-white rounded-lg font-semibold hover:bg-clinic-navy transition-colors" disabled={formLoading}>{formLoading ? 'Đang lưu...' : 'Lưu thông tin'}</button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Modal Cập nhật */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-center text-clinic-navy">Cập nhật bệnh nhân</h2>
          <form onSubmit={handleUpdatePatient} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Họ và tên *</label>
              <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập họ và tên" />
            </div>
            <div>
              <label className="block mb-1 font-medium">CCCD *</label>
              <input type="text" name="citizenId" value={editFormData.citizenId} onChange={handleEditInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập số CCCD" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Số điện thoại *</label>
              <input type="tel" name="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập email" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Ngày sinh *</label>
              <input type="date" name="dateOfBirth" value={editFormData.dateOfBirth} onChange={handleEditInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Giới tính *</label>
              <select name="gender" value={editFormData.gender} onChange={handleEditInputChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Địa chỉ</label>
              <input type="text" name="address" value={editFormData.address} onChange={handleEditInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue" placeholder="Nhập địa chỉ" />
            </div>
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100" disabled={editFormLoading}>Hủy</button>
              <button type="submit" className="px-6 py-2 bg-clinic-blue text-white rounded-lg font-semibold hover:bg-clinic-navy transition-colors" disabled={editFormLoading}>{editFormLoading ? 'Đang lưu...' : 'Lưu thông tin'}</button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Modal Chi tiết bệnh nhân */}
      <Modal open={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedPatient(null); }}>
        {selectedPatient && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
            {/* Avatar + Tên */}
            <div className="flex flex-col items-center md:w-1/3 w-full">
              <div className="w-28 h-28 rounded-full bg-green-200 flex items-center justify-center mb-4">
                <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-xl font-bold text-clinic-navy mb-1">{selectedPatient.name}</div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Bệnh nhân</span>
            </div>
            {/* Thông tin chi tiết */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="font-semibold text-lg mb-2">Thông Tin Liên Hệ</div>
                <div className="flex flex-col gap-2 text-gray-700">
                  <div className="flex items-center gap-2"><Phone size={16} /> {selectedPatient.phoneNumber || 'Chưa cập nhật'}</div>
                  <div className="flex items-center gap-2"><Mail size={16} /> {selectedPatient.email || 'Chưa cập nhật'}</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-base">location_on</span> {selectedPatient.address || 'Chưa cập nhật'}</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-base">cake</span> Sinh: {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2">Thống Kê Khám Bệnh</div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded bg-blue-50 text-blue-700 font-semibold">Hồ sơ bệnh án</button>
                  <button className="px-4 py-2 rounded bg-green-50 text-green-700 font-semibold">Lần khám cuối</button>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2">Tiền Sử Bệnh</div>
                <div className="text-gray-500">Chưa có thông tin tiền sử bệnh</div>
              </div>
              <div className="flex gap-4 mt-4">
                <button className="px-5 py-2 bg-clinic-blue text-white rounded-lg font-semibold hover:bg-clinic-navy transition-colors">Chỉnh sửa Thông Tin</button>
                <button className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">Tạo Hồ Sơ Bệnh Án</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientListCommon; 
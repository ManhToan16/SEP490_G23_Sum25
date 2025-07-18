import React, { useEffect, useState } from "react";
import { adminService } from "@/shared/services/adminService"; // ĐÚNG
import Modal from "@/shared/components/common/Modal";

const initialForm = {
  name: "",
  phoneNumber: "",
  email: "",
  password: "",
  dateOfBirth: "",
  gender: "Nam",
  address: "",
  role: "TECHNICIAN",
};

const AccountManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = async (page = pageNumber, size = pageSize, role = roleFilter) => {
    try {
      const data = await adminService.getListUsers(page, size, role);
      setUsers(data.users);
      setTotalItems(data.totalItems);
      setPageNumber(data.pageNumber);
      setPageSize(data.pageSize);
      console.log("Số lượng user:", data.totalItems);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };

  useEffect(() => {
    fetchUsers(1, pageSize, roleFilter);
    // eslint-disable-next-line
  }, [roleFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminService.createUser(form);
      setShowForm(false);
      setForm(initialForm);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xóa thất bại!");
    }
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      password: "", // không show password cũ
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0,10) : "",
      gender: user.gender || "Nam",
      address: user.address || "",
      role: user.role || "TECHNICIAN",
    });
    setEditError("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    setEditError("");
    try {
      await adminService.updateUser(editUser.id, editForm);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err?.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-clinic-navy">Danh sách tài khoản</h1>
        <button
          className="clinic-button-primary px-4 py-2 rounded-lg text-base font-semibold shadow"
          onClick={() => setShowForm(true)}
        >
          + Thêm tài khoản
        </button>
        <select
          className="border rounded-lg px-4 py-2 min-w-[200px] text-base shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all hover:border-blue-400"
          value={roleFilter}
          onChange={e => {
            setRoleFilter(e.target.value);
          }}
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="TECHNICIAN">Technician</option>
          <option value="NURSE">Nurse</option>
        </select>
      </div>
      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Thêm tài khoản mới">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-5">
            <input name="name" value={form.name} onChange={handleInputChange} required placeholder="Họ tên" className="border p-3 rounded-lg text-lg" />
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} required placeholder="Số điện thoại" className="border p-3 rounded-lg text-lg" />
            <input name="email" value={form.email} onChange={handleInputChange} required placeholder="Email" className="border p-3 rounded-lg text-lg" />
            <input name="password" value={form.password} onChange={handleInputChange} required placeholder="Mật khẩu" type="password" className="border p-3 rounded-lg text-lg" />
            <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleInputChange} required placeholder="Ngày sinh (YYYY-MM-DD)" className="border p-3 rounded-lg text-lg" />
            <input name="gender" value={form.gender} onChange={handleInputChange} required placeholder="Giới tính" className="border p-3 rounded-lg text-lg" />
            <input name="address" value={form.address} onChange={handleInputChange} required placeholder="Địa chỉ" className="border p-3 rounded-lg text-lg" />
            <select name="role" value={form.role} onChange={handleInputChange} className="border p-3 rounded-lg text-lg">
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="NURSE">Nurse</option>
            </select>
            <div className="flex gap-3 mt-2 justify-center">
              <button type="submit" className="clinic-button-primary px-6 py-3 rounded-lg text-lg font-semibold shadow" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
              <button type="button" className="px-6 py-3 rounded-lg border text-lg font-semibold" onClick={() => setShowForm(false)}>
                Hủy
              </button>
            </div>
            {error && <div className="text-red-600 text-center font-medium">{error}</div>}
          </form>
        </Modal>
      )}
      {editUser && (
        <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Cập nhật tài khoản">
          <form onSubmit={handleUpdateUser} className="grid grid-cols-1 gap-5">
            <input name="name" value={editForm.name} onChange={handleEditInputChange} required placeholder="Họ tên" className="border p-3 rounded-lg text-lg" />
            <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditInputChange} required placeholder="Số điện thoại" className="border p-3 rounded-lg text-lg" />
            <input name="email" value={editForm.email} onChange={handleEditInputChange} required placeholder="Email" className="border p-3 rounded-lg text-lg" />
            <input name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditInputChange} required placeholder="Ngày sinh (YYYY-MM-DD)" className="border p-3 rounded-lg text-lg" />
            <input name="gender" value={editForm.gender} onChange={handleEditInputChange} required placeholder="Giới tính" className="border p-3 rounded-lg text-lg" />
            <input name="address" value={editForm.address} onChange={handleEditInputChange} required placeholder="Địa chỉ" className="border p-3 rounded-lg text-lg" />
            <select name="role" value={editForm.role} onChange={handleEditInputChange} className="border p-3 rounded-lg text-lg">
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="NURSE">Nurse</option>
            </select>
            <div className="flex gap-3 mt-2 justify-center">
              <button type="submit" className="clinic-button-primary px-6 py-3 rounded-lg text-lg font-semibold shadow" disabled={editLoading}>
                {editLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
              <button type="button" className="px-6 py-3 rounded-lg border text-lg font-semibold" onClick={() => setEditUser(null)}>
                Hủy
              </button>
            </div>
            {editError && <div className="text-red-600 text-center font-medium">{editError}</div>}
          </form>
        </Modal>
      )}

      <div className="bg-white rounded-xl shadow p-4">
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {/* Avatar hoặc icon */}
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold">
                      {user.name?.charAt(0)}
                    </span>
                    {user.name}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'RECEPTIONIST' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <button
                      className={`px-2 py-1 rounded-full text-xs font-semibold transition
                        ${user.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      onClick={async () => {
                        if (user.isActive) {
                          if (window.confirm("Bạn có muốn vô hiệu hóa người dùng này không?")) {
                            try {
                              await adminService.deactivateUser(user.id);
                              fetchUsers();
                            } catch (err) {
                              alert("Vô hiệu hóa thất bại!");
                            }
                          }
                        } else {
                          if (window.confirm("Bạn muốn kích hoạt người dùng này không?")) {
                            try {
                              await adminService.activateUser(user.id);
                              fetchUsers();
                            } catch (err) {
                              alert("Kích hoạt thất bại!");
                            }
                          }
                        }
                      }}
                    >
                      {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                      onClick={() => openEdit(user)}
                      type="button"
                    >
                      <i className="fa fa-edit"></i>
                      Cập nhật
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                      onClick={() => handleDelete(user.id)}
                      type="button"
                    >
                      <i className="fa fa-trash"></i>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          Trang {pageNumber} / {Math.ceil(totalItems / pageSize)}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => fetchUsers(pageNumber - 1, pageSize, roleFilter)}
            disabled={pageNumber === 1}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => fetchUsers(pageNumber + 1, pageSize, roleFilter)}
            disabled={pageNumber >= Math.ceil(totalItems / pageSize)}
          >
            Sau
          </button>
          <select
            className="ml-2 border rounded-lg px-4 py-2 min-w-[140px] text-base shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all hover:border-blue-400"
            value={pageSize}
            onChange={e => fetchUsers(1, Number(e.target.value), roleFilter)}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size} / trang</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
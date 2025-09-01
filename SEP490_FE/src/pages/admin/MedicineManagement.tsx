import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { adminService } from "@/shared/services/adminService";
import { useToast } from "@/shared/components/ui/use-toast";

const PAGE_SIZE = 10;

interface Medicine {
  id: string;
  name: string;
  activeIngredients: string;
  strength: string;
  packaging: string;
  unit: string;
  description: string;
  isActive: boolean;
}

interface MedicineForm {
  name: string;
  activeIngredients: string;
  strength: string;
  packaging: string;
  unit: string;
  description: string;
}

const MedicineManagement: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Medicine[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [current, setCurrent] = useState<Medicine | null>(null);
  const [form, setForm] = useState<MedicineForm>({
    name: "",
    activeIngredients: "",
    strength: "",
    packaging: "",
    unit: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    activeIngredients: "",
    strength: "",
    packaging: "",
    unit: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Validation helper function
  const validateMedicineData = (data: MedicineForm): string[] => {
    const errors: string[] = [];

    // Validate required fields
    if (!data.name.trim()) {
      errors.push("Tên thuốc là bắt buộc.");
    }
    if (!data.activeIngredients.trim()) {
      errors.push("Hoạt chất là bắt buộc.");
    }
    if (!data.strength.trim()) {
      errors.push("Hàm lượng là bắt buộc.");
    }
    if (!data.packaging.trim()) {
      errors.push("Quy cách đóng gói là bắt buộc.");
    }
    if (!data.unit.trim()) {
      errors.push("Đơn vị là bắt buộc.");
    }

    // Validate string length
    if (data.name.length > 200) {
      errors.push("Tên thuốc không được vượt quá 200 ký tự.");
    }
    if (data.packaging.length > 50) {
      errors.push("Quy cách đóng gói không được vượt quá 50 ký tự.");
    }
    if (data.unit.length > 50) {
      errors.push("Đơn vị không được vượt quá 50 ký tự.");
    }

    // Validate pattern (only letters, numbers, spaces, hyphens, and dots)
    const pattern = /^[\p{L}0-9\s\-.]+$/u;
    if (data.name && !pattern.test(data.name)) {
      errors.push(
        "Tên thuốc chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm."
      );
    }
    if (data.activeIngredients && !pattern.test(data.activeIngredients)) {
      errors.push(
        "Hoạt chất chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm."
      );
    }
    if (data.strength && !pattern.test(data.strength)) {
      errors.push(
        "Hàm lượng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm."
      );
    }
    if (data.packaging && !pattern.test(data.packaging)) {
      errors.push(
        "Quy cách đóng gói chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm."
      );
    }
    if (data.unit && !pattern.test(data.unit)) {
      errors.push(
        "Đơn vị chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm."
      );
    }

    return errors;
  };

  const fetchData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getMedicineList(pageNumber, PAGE_SIZE);
      console.log("Medicine data response:", res);

      setData(res.items || []);
      setTotalItems(res.totalItems || 0);
      setPage(res.pageNumber || 1);
    } catch (error: any) {
      console.error("Error fetching medicines:", error);
      console.error("Error details:", error?.response?.data);

      let errorMessage = "Không thể tải danh sách thuốc";

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors
            .map((err: any) => err.error)
            .join(", ");
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Combined effect for both page changes and search
  useEffect(() => {
    // Reset page to 1 when search term changes
    if (searchTerm !== "" && page !== 1) {
      setPage(1);
      return;
    }

    const timeoutId = setTimeout(
      () => {
        fetchData(page);
      },
      searchTerm ? 500 : 0
    ); // Debounce only for search

    return () => clearTimeout(timeoutId);
  }, [page, searchTerm, fetchData]);

  const openAdd = () => {
    setModalType("add");
    setForm({
      name: "",
      activeIngredients: "",
      strength: "",
      packaging: "",
      unit: "",
      description: "",
    });
    setCurrent(null);
    setShowModal(true);
  };

  const openEdit = (item: Medicine) => {
    setModalType("edit");
    setForm({
      name: item.name,
      activeIngredients: item.activeIngredients,
      strength: item.strength,
      packaging: item.packaging,
      unit: item.unit,
      description: item.description,
    });
    setCurrent(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrent(null);
    setForm({
      name: "",
      activeIngredients: "",
      strength: "",
      packaging: "",
      unit: "",
      description: "",
    });
  };

  const handleSave = async () => {
    // Validate form data
    const validationErrors = validateMedicineData(form);
    if (validationErrors.length > 0) {
      toast({
        title: "Lỗi",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (modalType === "add") {
        await adminService.createMedicine(form);
      } else if (modalType === "edit" && current) {
        await adminService.updateMedicine(current.id, form);
      }

      toast({
        title: "Thành công",
        description: `${
          modalType === "add" ? "Thêm" : "Cập nhật"
        } thuốc thành công`,
        variant: "default",
      });

      closeModal();
      fetchData(page);
    } catch (error: any) {
      console.error("Error submitting medicine:", error);
      console.error("Error details:", error?.response?.data);

      let errorMessage = "Không thể lưu thuốc";

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Kiểm tra cấu trúc lỗi validation từ backend
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Nếu có validation errors, hiển thị tất cả lỗi
          const validationErrors = errorData.errors
            .map((err: any) => err.error)
            .join(", ");
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
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
      await adminService.deleteMedicine(deleteId);
      toast({
        title: "Thành công",
        description: "Xóa thuốc thành công",
        variant: "default",
      });
      setDeleteId(null);
      fetchData(page);
    } catch (error: any) {
      console.error("Error deleting medicine:", error);
      console.error("Error details:", error?.response?.data);

      let errorMessage = "Không thể xóa thuốc";

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors
            .map((err: any) => err.error)
            .join(", ");
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  // ...existing code...
  const handleActivate = async (id: string) => {
    setActiveId(id);
    try {
      await adminService.activeMedicine(id);
      toast({
        title: "Thành công",
        description: "Thuốc đã được kích hoạt lại",
        variant: "default",
      });
      fetchData(page);
    } catch (error: any) {
      console.error("Error activating medicine:", error);
      console.error("Error details:", error?.response?.data);

      let errorMessage = "Không thể kích hoạt lại thuốc";

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors
            .map((err: any) => err.error)
            .join(", ");
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActiveId(null);
    }
  };

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Filter options
  const filterOptions = useMemo(() => {
    const options = {
      name: [...new Set(data.map((item) => item.name))].sort(),
      activeIngredients: [
        ...new Set(data.map((item) => item.activeIngredients)),
      ].sort(),
      strength: [...new Set(data.map((item) => item.strength))].sort(),
      packaging: [...new Set(data.map((item) => item.packaging))].sort(),
      unit: [...new Set(data.map((item) => item.unit))].sort(),
    };
    return options;
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch =
        !filters.name ||
        item.name.toLowerCase().includes(filters.name.toLowerCase());
      const activeIngredientsMatch =
        !filters.activeIngredients ||
        item.activeIngredients
          .toLowerCase()
          .includes(filters.activeIngredients.toLowerCase());
      const strengthMatch =
        !filters.strength ||
        item.strength.toLowerCase().includes(filters.strength.toLowerCase());
      const packagingMatch =
        !filters.packaging ||
        item.packaging.toLowerCase().includes(filters.packaging.toLowerCase());
      const unitMatch =
        !filters.unit ||
        item.unit.toLowerCase().includes(filters.unit.toLowerCase());

      return (
        nameMatch &&
        activeIngredientsMatch &&
        strengthMatch &&
        packagingMatch &&
        unitMatch
      );
    });
  }, [data, filters]);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      name: "",
      activeIngredients: "",
      strength: "",
      packaging: "",
      unit: "",
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== ""
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-clinic-navy">Quản lý thuốc</h1>
        <p className="text-gray-600">Quản lý danh sách thuốc trong hệ thống</p>
      </div>

      {/* Search and Add */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-clinic-blue"></div>
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? "bg-clinic-blue text-white border-clinic-blue"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} />
            <span className="text-sm">Bộ lọc</span>
            {hasActiveFilters && (
              <span className="bg-white text-clinic-blue text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter((f) => f !== "").length}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={openAdd}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-clinic-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          <span>Thêm thuốc</span>
        </button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              Bộ lọc nâng cao
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-clinic-blue hover:text-blue-600"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Name Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên thuốc
              </label>
              <select
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Tất cả</option>
                {filterOptions.name.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Ingredients Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Hoạt chất
              </label>
              <select
                value={filters.activeIngredients}
                onChange={(e) =>
                  setFilters({ ...filters, activeIngredients: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Tất cả</option>
                {filterOptions.activeIngredients.map((ingredient) => (
                  <option key={ingredient} value={ingredient}>
                    {ingredient}
                  </option>
                ))}
              </select>
            </div>

            {/* Strength Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Liều lượng
              </label>
              <select
                value={filters.strength}
                onChange={(e) =>
                  setFilters({ ...filters, strength: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Tất cả</option>
                {filterOptions.strength.map((strength) => (
                  <option key={strength} value={strength}>
                    {strength}
                  </option>
                ))}
              </select>
            </div>

            {/* Packaging Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quy cách
              </label>
              <select
                value={filters.packaging}
                onChange={(e) =>
                  setFilters({ ...filters, packaging: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Tất cả</option>
                {filterOptions.packaging.map((packaging) => (
                  <option key={packaging} value={packaging}>
                    {packaging}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Đơn vị
              </label>
              <select
                value={filters.unit}
                onChange={(e) =>
                  setFilters({ ...filters, unit: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
              >
                <option value="">Tất cả</option>
                {filterOptions.unit.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên thuốc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt chất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liều lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quy cách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn vị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl">📋</div>
                      <div className="text-lg font-medium">
                        Không có thuốc nào
                      </div>
                      <div className="text-sm">
                        {searchTerm || hasActiveFilters
                          ? "Không tìm thấy thuốc phù hợp với bộ lọc"
                          : "Chưa có thuốc nào được thêm vào hệ thống"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.activeIngredients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.strength}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.packaging}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={item.description}>
                        {item.description || "Không có mô tả"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.isActive ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold text-xs">
                          Hoạt động
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(item.id)}
                          disabled={saving}
                          className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold text-xs hover:bg-yellow-200 transition"
                        >
                          {saving ? "Đang kích hoạt..." : "Kích hoạt lại"}
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-clinic-blue hover:text-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Hiển thị {(page - 1) * PAGE_SIZE + 1} đến{" "}
            {Math.min(page * PAGE_SIZE, totalItems)} của {totalItems} kết quả
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm bg-gray-100 rounded">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Show pagination info even when there's only one page */}
      {totalItems > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {hasActiveFilters || searchTerm ? (
            <>
              Hiển thị {filteredData.length} trong tổng số {totalItems} thuốc
              {(hasActiveFilters || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    clearAllFilters();
                  }}
                  className="ml-2 text-clinic-blue hover:text-blue-600 underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </>
          ) : (
            `Tổng cộng ${totalItems} thuốc`
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-clinic-navy">
                {modalType === "add" ? "Thêm thuốc mới" : "Cập nhật thuốc"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Nhập tên thuốc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hoạt chất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.activeIngredients}
                    onChange={(e) =>
                      setForm({ ...form, activeIngredients: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Nhập hoạt chất"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liều lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.strength}
                    onChange={(e) =>
                      setForm({ ...form, strength: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Ví dụ: 500 mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quy cách đóng gói <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.packaging}
                    onChange={(e) =>
                      setForm({ ...form, packaging: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                    placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Ví dụ: Viên nén, Viên nang, Bình hít"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
                  placeholder="Mô tả công dụng, chỉ định..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-clinic-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? "Đang lưu..." : "Lưu"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-clinic-navy mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa thuốc này không? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 size={16} />
                )}
                <span>{saving ? "Đang xóa..." : "Xóa"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;

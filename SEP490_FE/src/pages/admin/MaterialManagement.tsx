import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Edit, Trash2, X, Save, Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';
import { useToast } from "@/shared/components/ui/use-toast";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/components/ui/pagination";

const PAGE_SIZE = 10;

interface Material {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  supplierId: string | null;
  supplierName: string | null;
  unit: string;
  quantityInStock: number;
  maxQuantity: number;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialForm {
  name: string;
  categoryId: string;
  supplierId: string | null;
  unit: string;
  quantityInStock: number;
  maxQuantity: number;
  minQuantity: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Supplier {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  description: string;
}

// Memoized Select Components for better performance
const CategorySelect = React.memo(({ 
  value, 
  onValueChange, 
  categories 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  categories: Category[] 
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue placeholder="Chọn danh mục" />
    </SelectTrigger>
    <SelectContent>
      {categories.map((category) => (
        <SelectItem key={category.id} value={category.id}>
          {category.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));

const SupplierSelect = React.memo(({ 
  value, 
  onValueChange, 
  suppliers 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  suppliers: Supplier[] 
}) => (
  <Select value={value || 'no-supplier'} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue placeholder="Chọn nhà cung cấp" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="no-supplier">Chọn nhà cung cấp</SelectItem>
      {suppliers.map((supplier) => (
        <SelectItem key={supplier.id} value={supplier.id}>
          {supplier.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));

// Lazy loaded modal content component
const MaterialFormModal = React.memo(({ 
  showModal, 
  modalType, 
  form, 
  setForm, 
  categories, 
  suppliers, 
  handleSave, 
  saving, 
  closeModal 
}: {
  showModal: boolean;
  modalType: 'add' | 'edit';
  form: MaterialForm;
  setForm: React.Dispatch<React.SetStateAction<MaterialForm>>;
  categories: Category[];
  suppliers: Supplier[];
  handleSave: () => void;
  saving: boolean;
  closeModal: () => void;
}) => {
  // Memoized form handlers
  const handleCategoryChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, categoryId: value }));
  }, [setForm]);

  const handleSupplierChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, supplierId: value === 'no-supplier' ? null : value }));
  }, [setForm]);

  if (!showModal) return null;

  return (
    <Dialog open={showModal} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {modalType === 'add' ? 'Thêm vật tư mới' : 'Cập nhật vật tư'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên vật tư *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên vật tư"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Danh mục *</Label>
            <CategorySelect 
              value={form.categoryId} 
              onValueChange={handleCategoryChange}
              categories={categories}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier">Nhà cung cấp *</Label>
            <SupplierSelect 
              value={form.supplierId || 'no-supplier'} 
              onValueChange={handleSupplierChange}
              suppliers={suppliers}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Đơn vị *</Label>
            <Input
              id="unit"
              value={form.unit}
              onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="Ví dụ: Cái, Hộp, Kg..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantityInStock">Số lượng hiện tại</Label>
            <Input
              id="quantityInStock"
              type="number"
              value={form.quantityInStock}
              onChange={(e) => setForm(prev => ({ ...prev, quantityInStock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              disabled={true} // Disable for both add and edit
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Số lượng hiện tại sẽ được cập nhật thông qua chức năng nhập/xuất kho.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxQuantity">Số lượng tối đa</Label>
            <Input
              id="maxQuantity"
              type="number"
              value={form.maxQuantity}
              onChange={(e) => setForm(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minQuantity">Số lượng tối thiểu</Label>
            <Input
              id="minQuantity"
              type="number"
              value={form.minQuantity}
              onChange={(e) => setForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.categoryId || !form.unit || !form.supplierId || form.supplierId === 'no-supplier'}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const MaterialManagement: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Material[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');

  const [current, setCurrent] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>({
    name: '',
    categoryId: '',
    supplierId: null,
    unit: '',
    quantityInStock: 0,
    maxQuantity: 0,
    minQuantity: 0
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: 'all',
    supplierId: 'all',
    unit: ''
  });

  const fetchData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getMaterialList(pageNumber, PAGE_SIZE);
      console.log('Material data response:', res);
      
      setData(res.items || []);
      setTotalItems(res.totalItems || 0);
      setPage(res.pageNumber || 1);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách vật tư";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove toast from dependencies to prevent re-creation

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminService.getCategories();
      setCategories(res || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await adminService.getSupplierList();
      setSuppliers(res || []);
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  // Fetch categories and suppliers only once on component mount
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []); // Empty dependency array - only run once on mount

  const openAdd = useCallback(() => {
    setModalType('add');
    setForm({
      name: '',
      categoryId: '',
      supplierId: null,
      unit: '',
      quantityInStock: 0, // Always start with 0 for new materials
      maxQuantity: 0,
      minQuantity: 0
    });
    setCurrent(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((item: Material) => {
    setModalType('edit');
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      supplierId: item.supplierId,
      unit: item.unit,
      quantityInStock: item.quantityInStock,
      maxQuantity: item.maxQuantity,
      minQuantity: item.minQuantity
    });
    setCurrent(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setCurrent(null);
    setForm({
      name: '',
      categoryId: '',
      supplierId: null,
      unit: '',
      quantityInStock: 0,
      maxQuantity: 0,
      minQuantity: 0
    });
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.unit || !form.supplierId || form.supplierId === 'no-supplier') {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc, bao gồm Nhà cung cấp",
        variant: "destructive",
      });
      return;
    }

    if (form.minQuantity > form.maxQuantity) {
      toast({
        title: "Lỗi",
        description: "Số lượng tối thiểu không thể lớn hơn số lượng tối đa",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Prepare form data with proper supplierId handling
      const formData = {
        ...form,
        supplierId: form.supplierId === 'no-supplier' ? null : form.supplierId,
        quantityInStock: modalType === 'add' ? 0 : form.quantityInStock // Always 0 for new materials
      };
      
      if (modalType === 'add') {
        await adminService.createMaterial(formData);
        toast({
          title: "Thành công",
          description: "Thêm vật tư thành công",
        });
      } else if (modalType === 'edit' && current) {
        await adminService.updateMaterial(current.id, formData);
        toast({
          title: "Thành công",
          description: "Cập nhật vật tư thành công",
        });
      }
      
      closeModal();
      fetchData(page);
    } catch (error: any) {
      console.error('Error submitting material:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể lưu vật tư";
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
    
    // Find the material to check quantity
    const materialToDelete = data.find(item => item.id === deleteId);
    if (materialToDelete && materialToDelete.quantityInStock > 0) {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa vật tư có số lượng hiện tại > 0. Vui lòng xuất hết kho trước khi xóa.",
        variant: "destructive",
      });
      setDeleteId(null);
      return;
    }
    
    try {
      await adminService.deleteMaterial(deleteId);
      toast({
        title: "Thành công",
        description: "Xóa vật tư thành công",
      });
      fetchData(page);
    } catch (error: any) {
      console.error('Error deleting material:', error);
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa vật tư";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      categoryId: 'all',
      supplierId: 'all',
      unit: ''
    });
    setSearchTerm('');
  };

  const getStockStatus = (quantity: number, minQuantity: number, maxQuantity: number) => {
    if (quantity <= minQuantity) {
      return { status: 'low', text: 'Thiếu hàng', color: 'bg-red-100 text-red-800' };
    } else if (quantity >= maxQuantity) {
      return { status: 'full', text: 'Đầy kho', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'normal', text: 'Bình thường', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.categoryId || filters.categoryId === 'all' || item.categoryId === filters.categoryId;
      const matchesSupplier = !filters.supplierId || filters.supplierId === 'all' || item.supplierId === filters.supplierId;
      const matchesUnit = !filters.unit || item.unit.toLowerCase().includes(filters.unit.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesSupplier && matchesUnit;
    });
  }, [data, searchTerm, filters]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Vật tư</h1>
          <p className="text-muted-foreground">Quản lý danh sách vật tư y tế</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm vật tư
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm vật tư..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            <Button variant="outline" onClick={clearAllFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category-filter">Danh mục</Label>
                <Select value={filters.categoryId} onValueChange={(value) => setFilters(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="supplier-filter">Nhà cung cấp</Label>
                <Select value={filters.supplierId} onValueChange={(value) => setFilters(prev => ({ ...prev, supplierId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit-filter">Đơn vị</Label>
                <Input
                  placeholder="Nhập đơn vị..."
                  value={filters.unit}
                  onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách vật tư</CardTitle>
          <CardDescription>
            Hiển thị {filteredData.length} trong tổng số {totalItems} vật tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên vật tư</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const stockStatus = getStockStatus(item.quantityInStock, item.minQuantity, item.maxQuantity);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.categoryName}</TableCell>
                        <TableCell>{item.supplierName || 'Chưa có'}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.quantityInStock}</span>
                            <span className="text-xs text-muted-foreground">
                              Min: {item.minQuantity} | Max: {item.maxQuantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(item.id)}
                              disabled={item.quantityInStock > 0}
                              className={item.quantityInStock > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                              title={item.quantityInStock > 0 ? 'Không thể xóa vật tư có số lượng > 0' : 'Xóa vật tư'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy vật tư nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setPage(totalPages)}
                      isActive={page === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Lazy loaded Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <MaterialFormModal
          showModal={showModal}
          modalType={modalType}
          form={form}
          setForm={setForm}
          categories={categories}
          suppliers={suppliers}
          handleSave={handleSave}
          saving={saving}
          closeModal={closeModal}
        />
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const materialToDelete = data.find(item => item.id === deleteId);
                if (materialToDelete && materialToDelete.quantityInStock > 0) {
                  return `Không thể xóa vật tư "${materialToDelete.name}" vì còn ${materialToDelete.quantityInStock} ${materialToDelete.unit} trong kho. Vui lòng xuất hết kho trước khi xóa.`;
                }
                return `Bạn có chắc chắn muốn xóa vật tư này? Hành động này không thể hoàn tác.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={(() => {
                const materialToDelete = data.find(item => item.id === deleteId);
                return materialToDelete && materialToDelete.quantityInStock > 0;
              })()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaterialManagement;

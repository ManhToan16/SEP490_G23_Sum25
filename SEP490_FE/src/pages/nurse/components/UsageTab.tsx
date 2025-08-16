import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Package, Plus, AlertTriangle, CheckCircle, Truck, History, FileText, Calendar, User, Loader2, Minus } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/business/useAuth';
import { transactionService, TotalByRoomDTO, UsageHistoryDTO, UseMaterialRequestDTO } from '../../../shared/services/transactionService';
import { useToast } from '@/shared/components/ui/use-toast';

interface UsageTabProps {
  // Có thể thêm props nếu cần
}

const UsageTab: React.FC<UsageTabProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State cho API data
  const [availableMaterials, setAvailableMaterials] = useState<TotalByRoomDTO[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho dialog sử dụng vật tư
  const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [useQuantity, setUseQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStockStatusBadge = (isLowStock: boolean, totalQuantity: number) => {
    const CompactBadge = ({ children, className }: { children: React.ReactNode; className: string }) => (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium ${className}`}>
        {children}
      </span>
    );
    
    if (totalQuantity === 0) {
      return <CompactBadge className="bg-red-50 text-red-700 border border-red-200">Hết hàng</CompactBadge>;
    } else if (isLowStock) {
      return <CompactBadge className="bg-orange-50 text-orange-700 border border-orange-200">Thiếu hàng</CompactBadge>;
    } else {
      return <CompactBadge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Đủ hàng</CompactBadge>;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (dateTimeString === '0001-01-01T00:00:00') {
      return 'Chưa có thông tin';
    }
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Function để fetch data từ API
  const fetchUsageData = async () => {
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin y tá');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Lấy danh sách vật tư có sẵn
      const materialsData = await transactionService.getTotalByRoomId(userId);
      setAvailableMaterials(materialsData || []);

      // Lấy lịch sử sử dụng
      const historyData = await transactionService.getUsageHistory(userId);
      setUsageHistory(historyData || []);
    } catch (error: any) {
      setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setAvailableMaterials([]);
      setUsageHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Function để xử lý sử dụng vật tư
  const handleUseMaterial = async () => {
    if (!selectedMaterial || useQuantity <= 0) {
      toast({
        title: "Lỗi!",
        description: 'Vui lòng chọn vật tư và nhập số lượng hợp lệ',
        variant: "destructive",
      });
      return;
    }

    const userId = user?.UserId || user?.id;
    if (!userId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin y tá',
        variant: "destructive",
      });
      return;
    }

    // Tìm thông tin vật tư được chọn
    const material = availableMaterials.find(m => m.materialId === selectedMaterial);
    if (!material) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin vật tư',
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra số lượng có đủ không
    if (useQuantity > material.totalQuantity) {
      toast({
        title: "Lỗi!",
        description: `Số lượng sử dụng (${useQuantity}) vượt quá số lượng có sẵn (${material.totalQuantity})`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const request: UseMaterialRequestDTO = {
        materialId: selectedMaterial,
        quantity: useQuantity,
        roomId: material.roomId
      };

      await transactionService.useMaterial(request);
      
      toast({
        title: "Thành công!",
        description: `Đã sử dụng ${useQuantity} ${material.materialName}`,
        variant: "success",
      });

             // Reset form
       setSelectedMaterial('');
       setUseQuantity(0);
       setIsUseDialogOpen(false);

      // Refresh lại dữ liệu
      await fetchUsageData();
      
    } catch (error: any) {
      toast({
        title: "Lỗi!",
        description: error?.message || 'Có lỗi xảy ra khi sử dụng vật tư',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // useEffect để fetch data khi component mount
  useEffect(() => {
    fetchUsageData();
  }, [user]);

  // Lấy thông tin phòng từ localStorage
  const getClinicUserData = () => {
    try {
      const data = localStorage.getItem('clinic_user_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing clinic_user_data:', error);
      return null;
    }
  };

  const clinicUserData = getClinicUserData();

  return (
    <div className="space-y-8">
      {/* Header với thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Vật tư có sẵn</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{availableMaterials?.length || 0}</div>
            <p className="text-xs text-gray-600">Loại vật tư</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng số lượng</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {availableMaterials?.reduce((sum, material) => sum + (material.totalQuantity || 0), 0) || 0}
            </div>
            <p className="text-xs text-gray-600">Đơn vị</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Lần sử dụng</CardTitle>
            <History className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{usageHistory?.length || 0}</div>
            <p className="text-xs text-gray-600">Hoạt động</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng đã sử dụng</CardTitle>
            <Minus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usageHistory?.reduce((sum, history) => sum + (history.quantityUsed || 0), 0) || 0}
            </div>
            <p className="text-xs text-gray-600">Đơn vị</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
              <Loader2 className="h-6 w-6" />
            </div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={fetchUsageData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Content khi không có lỗi */}
      {!loading && !error && (
        <>
          {/* Bảng vật tư có sẵn */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Vật tư có sẵn trong phòng</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {clinicUserData?.unique_name ? `Y tá: ${clinicUserData.unique_name}` : 'Thông tin vật tư hiện có'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={fetchUsageData} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Làm mới
                  </Button>
                  <Dialog open={isUseDialogOpen} onOpenChange={setIsUseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Sử dụng vật tư
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Sử dụng vật tư</DialogTitle>
                      </DialogHeader>
                                             <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <Label htmlFor="material">Vật tư</Label>
                             <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Chọn vật tư" />
                               </SelectTrigger>
                               <SelectContent>
                                 {availableMaterials.map((material) => (
                                   <SelectItem key={material.materialId} value={material.materialId}>
                                     {material.materialName} ({material.totalQuantity} đơn vị)
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                           <div>
                             <Label htmlFor="quantity">Số lượng sử dụng</Label>
                             <Input 
                               id="quantity" 
                               type="number" 
                               placeholder="0" 
                               value={useQuantity}
                               onChange={(e) => setUseQuantity(Number(e.target.value))}
                               min="1"
                             />
                           </div>
                         </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsUseDialogOpen(false)}
                            disabled={isSubmitting}
                          >
                            Hủy
                          </Button>
                          <Button 
                            onClick={handleUseMaterial}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              'Sử dụng'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {availableMaterials?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Vật tư</TableHead>
                        <TableHead className="font-semibold text-gray-900">Số lượng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Phòng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Tình trạng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableMaterials.map((material, index) => (
                        <TableRow key={`material-${material.materialId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">{material.materialName}</div>
                            <div className="text-sm text-gray-500">ID: {material.materialId}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-gray-900">{material.totalQuantity} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{material.roomName}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {material.roomType === 'EXAMINATION' ? 'Phòng khám' : 
                               material.roomType === 'LABORATORY' ? 'Phòng xét nghiệm' : 
                               material.roomType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStockStatusBadge(material.isLowStock, material.totalQuantity)}
                          </TableCell>
                          <TableCell className="py-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedMaterial(material.materialId);
                                setUseQuantity(1);
                                setIsUseDialogOpen(true);
                              }}
                              disabled={material.totalQuantity === 0}
                            >
                              Sử dụng
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không có vật tư nào
                  </h3>
                  <p className="text-gray-500">
                    Hiện tại không có vật tư nào trong phòng của bạn
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bảng lịch sử sử dụng */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Lịch sử sử dụng vật tư</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Theo dõi các hoạt động sử dụng vật tư</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usageHistory?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Vật tư</TableHead>
                        <TableHead className="font-semibold text-gray-900">Số lượng sử dụng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Tồn kho trước</TableHead>
                        <TableHead className="font-semibold text-gray-900">Tồn kho sau</TableHead>
                        <TableHead className="font-semibold text-gray-900">Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageHistory.map((history, index) => (
                        <TableRow key={`history-${history.historyId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">{history.materialName}</div>
                            <div className="text-sm text-gray-500">ID: {history.materialId}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-red-600">-{history.quantityUsed} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{history.oldQuantity} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-gray-900">{history.newQuantity} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{formatDateTime(history.changedAt)}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có lịch sử sử dụng
                  </h3>
                  <p className="text-gray-500">
                    Bạn chưa có hoạt động sử dụng vật tư nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UsageTab;

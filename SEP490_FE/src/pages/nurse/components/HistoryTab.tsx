import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { History, Search, Filter, RefreshCw, Calendar, User, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/business/useAuth';
import { transactionService, HistoryApproveRejectDTO } from '../../../shared/services/transactionService';
import { useToast } from '@/shared/components/ui/use-toast';

interface HistoryTabProps {
  // Có thể thêm props nếu cần
}

const HistoryTab: React.FC<HistoryTabProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State cho API data
  const [historyData, setHistoryData] = useState<HistoryApproveRejectDTO[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryApproveRejectDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho filter
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  const getActionBadge = (action: string) => {
    const normalizedAction = action?.toLowerCase()?.trim();
    
    const CompactBadge = ({ children, className }: { children: React.ReactNode; className: string }) => (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium ${className}`}>
        {children}
      </span>
    );
    
    if (normalizedAction?.includes('phê duyệt') || normalizedAction?.includes('approved')) {
      return (
        <CompactBadge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Được phê duyệt
        </CompactBadge>
      );
    } else if (normalizedAction?.includes('từ chối') || normalizedAction?.includes('rejected')) {
      return (
        <CompactBadge className="bg-red-50 text-red-700 border border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Bị từ chối
        </CompactBadge>
      );
    } else {
      return (
        <CompactBadge className="bg-gray-50 text-gray-600 border border-gray-200">
          {action || 'Không xác định'}
        </CompactBadge>
      );
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Function để fetch data từ API
  const fetchHistoryData = async () => {
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin y tá');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await transactionService.getHistoryApproveReject(userId);
      setHistoryData(data || []);
      setFilteredData(data || []);
    } catch (error: any) {
      setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu lịch sử');
      setHistoryData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function để filter data
  const applyFilters = () => {
    let filtered = [...historyData];

    // Filter theo search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(item => {
        const action = item.action.toLowerCase();
        if (actionFilter === 'approved') {
          return action.includes('phê duyệt') || action.includes('approved');
        } else if (actionFilter === 'rejected') {
          return action.includes('từ chối') || action.includes('rejected');
        }
        return true;
      });
    }

    // Filter theo material
    if (materialFilter !== 'all') {
      filtered = filtered.filter(item => item.materialId === materialFilter);
    }

    setFilteredData(filtered);
  };

  // useEffect để apply filters khi có thay đổi
  useEffect(() => {
    applyFilters();
  }, [searchTerm, actionFilter, materialFilter, historyData]);

  // useEffect để fetch data khi component mount
  useEffect(() => {
    fetchHistoryData();
  }, [user]);

  // Lấy danh sách unique materials cho filter
  const uniqueMaterials = Array.from(new Set(historyData.map(item => item.materialId)))
    .map(materialId => {
      const item = historyData.find(h => h.materialId === materialId);
      return { id: materialId, name: item?.materialName || materialId };
    });

  return (
    <div className="space-y-8">
      {/* Header với thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng số hoạt động</CardTitle>
            <History className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{historyData?.length || 0}</div>
            <p className="text-xs text-gray-600">Hoạt động</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Được phê duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {historyData?.filter(item => 
                item.action.toLowerCase().includes('phê duyệt') || 
                item.action.toLowerCase().includes('approved')
              ).length || 0}
            </div>
            <p className="text-xs text-gray-600">Lần</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Bị từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {historyData?.filter(item => 
                item.action.toLowerCase().includes('từ chối') || 
                item.action.toLowerCase().includes('rejected')
              ).length || 0}
            </div>
            <p className="text-xs text-gray-600">Lần</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng số lượng</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {historyData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
            </div>
            <p className="text-xs text-gray-600">Đơn vị</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc tìm kiếm</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Lọc và tìm kiếm trong lịch sử hoạt động</p>
            </div>
            <Button onClick={fetchHistoryData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên vật tư hoặc ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hành động</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="approved">Được phê duyệt</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Material Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vật tư</label>
              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vật tư" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vật tư</SelectItem>
                  {uniqueMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
              <Loader2 className="h-6 w-6" />
            </div>
            <p className="text-gray-500">Đang tải dữ liệu lịch sử...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <XCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={fetchHistoryData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* History Table */}
      {!loading && !error && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Lịch sử hoạt động</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filteredData.length} trong tổng số {historyData.length} hoạt động
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredData?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Vật tư</TableHead>
                      <TableHead className="font-semibold text-gray-900">Số lượng</TableHead>
                      <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                      <TableHead className="font-semibold text-gray-900">Thời gian</TableHead>
                      <TableHead className="font-semibold text-gray-900">ID Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={`history-${item.historyId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <TableCell className="py-4">
                          <div className="font-medium text-gray-900">{item.materialName}</div>
                          <div className="text-sm text-gray-500">ID: {item.materialId}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-gray-900">{item.quantity} đơn vị</div>
                        </TableCell>
                        <TableCell className="py-4">
                          {getActionBadge(item.action)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700">{formatDateTime(item.changedAt)}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-500 font-mono">{item.transactionId}</div>
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
                  {historyData.length === 0 ? 'Chưa có lịch sử hoạt động' : 'Không tìm thấy kết quả'}
                </h3>
                <p className="text-gray-500">
                  {historyData.length === 0 
                    ? 'Bạn chưa có hoạt động approve/reject nào' 
                    : 'Thử thay đổi bộ lọc để tìm kiếm'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoryTab;

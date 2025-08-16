import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Package, Plus, AlertTriangle, CheckCircle, Truck, History, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/business/useAuth';
import { transactionService, TransactionResponseDTO, ProvidedSummaryDTO } from '../../../shared/services/transactionService';
import { useToast } from '@/shared/components/ui/use-toast';

interface ReceiptTabProps {
  // Có thể thêm props nếu cần
}

const ReceiptTab: React.FC<ReceiptTabProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State cho API data
  const [pendingTransactions, setPendingTransactions] = useState<TransactionResponseDTO[]>([]);
  const [receivedSupplies, setReceivedSupplies] = useState<ProvidedSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noScheduleMessage, setNoScheduleMessage] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    // Normalize status string
    const normalizedStatus = status?.toUpperCase()?.trim();
    
    // Custom compact badge component
    const CompactBadge = ({ children, className }: { children: React.ReactNode; className: string }) => (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium ${className}`}>
        {children}
      </span>
    );
    
    switch (normalizedStatus) {
      case 'PENDING':
        return (
          <CompactBadge className="bg-amber-50 text-amber-700 border border-amber-200">
            Chờ nhận
          </CompactBadge>
        );
      case 'APPROVED':
        return (
          <CompactBadge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã nhận
          </CompactBadge>
        );
      case 'REJECTED':
        return (
          <CompactBadge className="bg-red-50 text-red-700 border border-red-200">
            Đã hủy
          </CompactBadge>
        );
      default:
        return (
          <CompactBadge className="bg-gray-50 text-gray-600 border border-gray-200">
            {status || 'Không xác định'}
          </CompactBadge>
        );
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Function để fetch data từ API
  const fetchReceiptData = async () => {
    const userId = user?.UserId || user?.id;
    if (!userId) {
      setError('Không tìm thấy thông tin y tá');
      return;
    }

    setLoading(true);
    setError(null);
    setNoScheduleMessage(null);

    try {
      // Lấy danh sách hàng cần nhận hôm nay
      const pendingData = await transactionService.getPendingProvideTransactionsForNurse(userId);
      setPendingTransactions(pendingData || []);

      // Lấy danh sách hàng đã nhận
      const receivedData = await transactionService.getHistoryProvidedByRoomId(userId);
      setReceivedSupplies(receivedData || []);

    } catch (error: any) {
      // Xử lý trường hợp không có lịch làm việc hoặc không có lô hàng chờ duyệt
      if (error?.response?.data?.StatusCode === 404) {
        const message = error?.response?.data?.Message;
        if (message?.includes('Không có lô hàng nào đang chờ duyệt')) {
          // Không có lô hàng chờ duyệt - hiển thị bình thường với danh sách trống
          setPendingTransactions([]);
          setNoScheduleMessage(null);
          
          // Vẫn thử lấy history để hiển thị hàng đã nhận trước đó
          try {
            const receivedData = await transactionService.getHistoryProvidedByRoomId(userId);
            setReceivedSupplies(receivedData || []);
          } catch (historyError: any) {
            console.warn('Error fetching history:', historyError);
            setReceivedSupplies([]);
          }
        } else if (message?.includes('Không có lịch làm việc')) {
          // Không có lịch làm việc
          setNoScheduleMessage('Bạn không có lịch làm việc tại phòng nào hôm nay.');
          setPendingTransactions([]);
          setReceivedSupplies([]);
        } else {
          // Các lỗi 404 khác
          setNoScheduleMessage(message || 'Không tìm thấy dữ liệu');
          setPendingTransactions([]);
          setReceivedSupplies([]);
        }
      } else {
        // Các lỗi khác
        setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setPendingTransactions([]);
        setReceivedSupplies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function để xử lý nhận hàng
  const handleApproveTransaction = async (transactionId: string) => {
    const userId = user?.UserId || user?.id;
    if (!userId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin y tá',
        variant: "destructive",
      });
      return;
    }

    try {
      await transactionService.approveProvideTransaction(transactionId, userId);
      
      toast({
        title: "Thành công!",
        description: 'Đã nhận hàng thành công',
        variant: "success",
      });

      // Refresh lại dữ liệu
      await fetchReceiptData();
      
    } catch (error: any) {
      toast({
        title: "Lỗi!",
        description: error?.message || 'Có lỗi xảy ra khi nhận hàng',
        variant: "destructive",
      });
    }
  };

  // Function để xử lý từ chối hàng
  const handleRejectTransaction = async (transactionId: string) => {
    const userId = user?.UserId || user?.id;
    if (!userId) {
      toast({
        title: "Lỗi!",
        description: 'Không tìm thấy thông tin y tá',
        variant: "destructive",
      });
      return;
    }

    try {
      await transactionService.rejectProvideTransaction(transactionId, userId);
      
      toast({
        title: "Thành công!",
        description: 'Đã từ chối hàng thành công',
        variant: "success",
      });

      // Refresh lại dữ liệu
      await fetchReceiptData();
      
    } catch (error: any) {
      toast({
        title: "Lỗi!",
        description: error?.message || 'Có lỗi xảy ra khi từ chối hàng',
        variant: "destructive",
      });
    }
  };

  // useEffect để fetch data khi component mount
  useEffect(() => {
    fetchReceiptData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header với thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Hàng cần nhận</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingTransactions?.length || 0}</div>
            <p className="text-xs text-gray-600">Mục hàng</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng số lượng cần nhận</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTransactions?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0}
            </div>
            <p className="text-xs text-gray-600">Đơn vị</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Loại vật tư đã nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {receivedSupplies?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Loại vật tư</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Tổng số lượng đã nhận</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {receivedSupplies?.reduce((sum, supply) => sum + (supply.totalQuantity || 0), 0) || 0}
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
              onClick={fetchReceiptData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* No Schedule Message - chỉ hiển thị khi không có lịch làm việc */}
      {noScheduleMessage && !loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">{noScheduleMessage}</p>
          </div>
        </div>
      )}

      {/* Bảng hàng cần nhận hôm nay */}
      {!loading && !error && (
        <>
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Hàng cần nhận hôm nay</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Danh sách các vật tư cần nhận trong ngày</p>
                </div>
                <Button onClick={fetchReceiptData} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingTransactions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Vật tư</TableHead>
                        <TableHead className="font-semibold text-gray-900">Số lượng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Nhà cung cấp</TableHead>
                        <TableHead className="font-semibold text-gray-900">Phòng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Ngày tạo</TableHead>
                        <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTransactions.map((transaction, index) => (
                        <TableRow key={`transaction-${transaction.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">{transaction.materialName}</div>
                            <div className="text-sm text-gray-500">ID: {transaction.materialId}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-gray-900">{transaction.quantity} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{transaction.supplierName}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{transaction.roomType === 'EXAMINATION' ? 'Phòng khám' : 
                              transaction.roomType === 'LABORATORY' ? 'Phòng xét nghiệm' : 
                              transaction.roomType}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{formatDateTime(transaction.createdAt)}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(transaction.status || 'PENDING')}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApproveTransaction(transaction.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Nhận hàng
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectTransaction(transaction.id)}
                              >
                                Từ chối
                              </Button>
                            </div>
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
                    Không có hàng cần nhận
                  </h3>
                  <p className="text-gray-500">
                    Hiện tại không có hàng nào cần nhận hôm nay
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bảng hàng đã nhận */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Hàng đã nhận của phòng</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Tổng hợp các vật tư đã nhận theo phòng</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {receivedSupplies?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Vật tư</TableHead>
                        <TableHead className="font-semibold text-gray-900">Tổng số lượng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Phòng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Loại phòng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Tình trạng</TableHead>
                        <TableHead className="font-semibold text-gray-900">Chi tiết</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivedSupplies.map((supply, index) => (
                        <TableRow key={`supply-${supply.roomId}-${supply.materialName}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">{supply.materialName}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-gray-900">{supply.totalQuantity} đơn vị</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">{supply.roomName}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-xs">
                              {supply.roomType === 'EXAMINATION' ? 'Phòng khám' : 
                               supply.roomType === 'LABORATORY' ? 'Phòng xét nghiệm' : 
                               supply.roomType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant={supply.isLowStock ? "destructive" : "default"} className="text-xs">
                              {supply.isLowStock ? 'Thiếu hàng' : 'Đủ hàng'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Xem lô hàng
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Chi tiết lô hàng - {supply.materialName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Tổng số lượng:</Label>
                                      <p className="text-lg font-bold">{supply.totalQuantity} đơn vị</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Phòng:</Label>
                                      <p className="text-sm">{supply.roomName}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Danh sách lô hàng:</Label>
                                    <div className="mt-2 space-y-2">
                                      {supply.batchInfo.map((batch, index) => (
                                        <div key={batch.transactionId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                          <div>
                                            <span className="text-sm font-medium">Lô {index + 1}:</span>
                                            <span className="text-sm ml-2">{batch.quantity} đơn vị</span>
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {batch.status || 'Đã nhận'}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có hàng đã nhận
                  </h3>
                  <p className="text-gray-500">
                    Phòng chưa nhận hàng nào
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

export default ReceiptTab;

import React, { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, FileX, Edit } from 'lucide-react';

interface DefectiveReturnOrder {
    id: string;
    materialId: string;
    materialName: string | null;
    transactionType: string;
    quantity: number; // Số lượng lỗi hiện tại
    userId: string;
    userName: string | null;
    reason: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    price: number;
    supplierId: string | null;
    supplierName: string | null;
    isEdit: boolean;
}

interface DefectiveOrdersListProps {
    defectiveOrders: DefectiveReturnOrder[];
    onUpdateOrderStatus: (orderId: string, newStatus: DefectiveReturnOrder['status']) => void;
    onOpenEditModal: (order: DefectiveReturnOrder) => void;
    onUpdateDefectiveQuantity: (transactionId: string, newDefectiveQuantity: number) => Promise<void>;
    onApproveSupplierReturn: (transactionId: string) => Promise<void>;
    onRejectSupplierReturn: (transactionId: string) => Promise<void>;
    onRefreshData: () => Promise<void>;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const DefectiveOrdersList: React.FC<DefectiveOrdersListProps> = ({
    defectiveOrders,
    onUpdateOrderStatus,
    onOpenEditModal,
    onUpdateDefectiveQuantity,
    onApproveSupplierReturn,
    onRejectSupplierReturn,
    onRefreshData,
    formatCurrency,
    formatDate
}) => {
    const [materialNameFilter, setMaterialNameFilter] = useState('');
    const [transactionIdFilter, setTransactionIdFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredDefectiveOrders = useMemo(() => {
        let filtered = defectiveOrders.filter(order => {
            // Filter by material name
            if (materialNameFilter && order.materialName && !order.materialName.toLowerCase().includes(materialNameFilter.toLowerCase())) {
                return false;
            }
            
            // Filter by transaction ID
            if (transactionIdFilter && !order.id.toLowerCase().includes(transactionIdFilter.toLowerCase())) {
                return false;
            }
            
            // Filter by supplier
            if (supplierFilter && order.supplierName && !order.supplierName.toLowerCase().includes(supplierFilter.toLowerCase())) {
                return false;
            }
            
            return true;
        });

        // Sort by status: PENDING first, then others
        filtered.sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return 0;
        });

        return filtered;
    }, [defectiveOrders, materialNameFilter, transactionIdFilter, supplierFilter]
    );

    const getStatusColor = (status: DefectiveReturnOrder['status']) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: DefectiveReturnOrder['status']) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
            case 'REJECTED': return <FileX className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusText = (status: DefectiveReturnOrder['status']) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            default: return 'Không xác định';
        }
    };

    const formatDateTime = (dateString: string) => {
        // Format from "15/07/2025 18:50:00" to readable format
        return dateString;
    };

    const handleEditQuantity = (order: DefectiveReturnOrder) => {
        setEditingOrderId(order.id);
        setEditQuantity(order.quantity);
    };

    const handleSaveEdit = async (orderId: string) => {
        try {
            await onUpdateDefectiveQuantity(orderId, editQuantity);
            setEditingOrderId(null);
            setEditQuantity(0);
        } catch (error) {
            console.error('Error updating defective quantity:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingOrderId(null);
        setEditQuantity(0);
    };

    const clearFilters = () => {
        setMaterialNameFilter('');
        setTransactionIdFilter('');
        setSupplierFilter('');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefreshData();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                    Đơn đổi trả hàng lỗi
                </h2>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Tìm theo vật tư:</label>
                    <Input
                        type="text"
                        value={materialNameFilter}
                        onChange={(e) => setMaterialNameFilter(e.target.value)}
                        className="w-48"
                        placeholder="Nhập tên vật tư..."
                    />
                    
                    <label className="text-sm font-medium text-gray-700">Tìm theo ID:</label>
                    <Input
                        type="text"
                        value={transactionIdFilter}
                        onChange={(e) => setTransactionIdFilter(e.target.value)}
                        className="w-48"
                        placeholder="Nhập transaction ID..."
                    />
                    
                    <label className="text-sm font-medium text-gray-700">Tìm theo nhà cung cấp:</label>
                    <Input
                        type="text"
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value)}
                        className="w-48"
                        placeholder="Nhập tên nhà cung cấp..."
                    />
                    
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-3 h-8"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    
                    {(materialNameFilter || transactionIdFilter || supplierFilter) && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={clearFilters}
                            className="px-2 h-8"
                        >
                            ✕
                        </Button>
                    )}
                </div>
            </div>
            
            {filteredDefectiveOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    {(materialNameFilter || transactionIdFilter || supplierFilter) ? 
                        'Không có đơn đổi trả nào phù hợp với bộ lọc' :
                        'Chưa có đơn đổi trả hàng lỗi nào'
                    }
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {filteredDefectiveOrders.map((order) => (
                        <Card key={order.id} className="p-4 bg-white shadow-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 mb-1">
                                        {order.materialName || 'Vật tư không xác định'}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Loại: {order.transactionType === 'IMPORT' ? 'Nhập hàng' : 'Xuất hàng'}
                                    </p>
                                </div>
                                <Badge className={`${getStatusColor(order.status)} flex items-center text-xs`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 font-medium">
                                        {getStatusText(order.status)}
                                    </span>
                                </Badge>
                            </div>

                            <div className="space-y-1 text-xs mb-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID Giao dịch:</span>
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                        {order.id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nhà cung cấp:</span>
                                    <span className="font-medium">{order.supplierName || 'Chưa xác định'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Số lượng lỗi:</span>
                                    {editingOrderId === order.id ? (
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="number"
                                                value={editQuantity}
                                                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                                                className="w-20 h-6 text-xs"
                                                min="0"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveEdit(order.id)}
                                                className="h-6 px-2 text-xs"
                                            >
                                                ✓
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                className="h-6 px-2 text-xs"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                                                         ) : (
                                         <div className="flex items-center space-x-2">
                                             <span className="font-medium text-red-600">{order.quantity} sản phẩm</span>
                                             {order.isEdit && (
                                                 <Button
                                                     size="sm"
                                                     variant="outline"
                                                     onClick={() => handleEditQuantity(order)}
                                                     className="h-6 w-6 p-0"
                                                     title="Chỉnh sửa số lượng"
                                                 >
                                                     <Edit className="w-3 h-3" />
                                                 </Button>
                                             )}
                                         </div>
                                     )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lý do:</span>
                                    <span className="font-medium">{order.reason}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giá:</span>
                                    <span className="font-medium text-blue-600">{formatCurrency(order.price * order.quantity)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Người tạo:</span>
                                    <span className="font-medium">{order.userName || 'Chưa xác định'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cập nhật:</span>
                                    <span className="font-medium">{formatDateTime(order.updatedAt)}</span>
                                </div>
                            </div>



                            {order.status === 'PENDING' && (
                                <div className="flex space-x-2">
                                    {order.isEdit && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onOpenEditModal(order)}
                                            className="flex-1 h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Chỉnh sửa
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => onApproveSupplierReturn(order.id)}
                                        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Duyệt
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onRejectSupplierReturn(order.id)}
                                        className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <FileX className="w-3 h-3 mr-1" />
                                        Từ chối
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DefectiveOrdersList; 
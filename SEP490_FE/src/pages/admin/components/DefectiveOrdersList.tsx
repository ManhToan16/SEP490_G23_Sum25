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
    quantity: number;
    defectiveQuantity: number;
    roomId: string | null;
    roomType: string | null;
    userId: string;
    userName: string | null;
    reason: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    price: number;
    supplierId: string | null;
    supplierName: string | null;
}

interface DefectiveOrdersListProps {
    defectiveOrders: DefectiveReturnOrder[];
    onUpdateOrderStatus: (orderId: string, newStatus: DefectiveReturnOrder['status']) => void;
    onOpenEditModal: (order: DefectiveReturnOrder) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const DefectiveOrdersList: React.FC<DefectiveOrdersListProps> = ({
    defectiveOrders,
    onUpdateOrderStatus,
    onOpenEditModal,
    formatCurrency,
    formatDate
}) => {
    const [defectiveOrderDateFilter, setDefectiveOrderDateFilter] = useState('');

    const filteredDefectiveOrders = useMemo(() => 
        defectiveOrders.filter(order => {
            if (!defectiveOrderDateFilter) return true;
            
            // Parse createdAt format: "15/07/2025 18:50:00"
            const orderDateParts = order.createdAt.split(' ')[0].split('/');
            const orderDateFormatted = `${orderDateParts[2]}-${orderDateParts[1].padStart(2, '0')}-${orderDateParts[0].padStart(2, '0')}`;
            
            return orderDateFormatted === defectiveOrderDateFilter;
        }), [defectiveOrders, defectiveOrderDateFilter]
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                    Đơn đổi trả hàng lỗi
                </h2>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Tìm theo ngày:</label>
                    <Input
                        type="date"
                        value={defectiveOrderDateFilter}
                        onChange={(e) => setDefectiveOrderDateFilter(e.target.value)}
                        className="w-36"
                        placeholder="Chọn ngày"
                    />
                    {defectiveOrderDateFilter && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDefectiveOrderDateFilter('')}
                            className="px-2 h-8"
                        >
                            ✕
                        </Button>
                    )}
                </div>
            </div>
            
            {filteredDefectiveOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    {defectiveOrderDateFilter ? 
                        `Không có đơn đổi trả nào trong ngày ${formatDate(defectiveOrderDateFilter)}` :
                        'Chưa có đơn đổi trả hàng lỗi nào'
                    }
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số lượng tổng:</span>
                                    <span className="font-medium text-blue-600">{order.quantity} sản phẩm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số lượng lỗi:</span>
                                    <span className="font-medium text-red-600">{order.defectiveQuantity} sản phẩm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lý do:</span>
                                    <span className="font-medium">{order.reason}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giá:</span>
                                    <span className="font-medium text-blue-600">{formatCurrency(order.price * order.defectiveQuantity)}</span>
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

                            {order.roomId && (
                                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-700">
                                        <strong>Phòng:</strong> {order.roomType === 'LABORATORY' ? 'Phòng xét nghiệm' : 'Phòng khám'} (ID: {order.roomId})
                                    </p>
                                </div>
                            )}

                            {order.status === 'PENDING' && (
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onOpenEditModal(order)}
                                        className="flex-1 h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onUpdateOrderStatus(order.id, 'APPROVED')}
                                        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Duyệt
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onUpdateOrderStatus(order.id, 'REJECTED')}
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
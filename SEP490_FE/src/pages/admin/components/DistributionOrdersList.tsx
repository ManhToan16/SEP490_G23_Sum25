import React, { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Package, Clock, CheckCircle, FileX, Edit, ChevronDown, ChevronUp } from 'lucide-react';

interface DistributionOrder {
    id: string;
    materialId: number;
    materialName: string;
    materialUnit: string;
    distributions: Record<string, number>;
    totalQuantity: number;
    status: 'pending' | 'completed' | 'rejected';
    createdDate: string;
    createdBy: string;
    note?: string;
}

interface DistributionOrdersListProps {
    distributionOrders: DistributionOrder[];
    onUpdateOrderStatus: (orderId: string, newStatus: DistributionOrder['status']) => void;
    onOpenEditModal: (order: DistributionOrder) => void;
    formatNumber: (value: string) => string;
    formatDate: (dateString: string) => string;
}

const DistributionOrdersList: React.FC<DistributionOrdersListProps> = ({
    distributionOrders,
    onUpdateOrderStatus,
    onOpenEditModal,
    formatNumber,
    formatDate
}) => {
    const [distributionOrderDateFilter, setDistributionOrderDateFilter] = useState('');
    const [expandedDistributionDetails, setExpandedDistributionDetails] = useState<Record<string, boolean>>({});

    const filteredDistributionOrders = useMemo(() => 
        distributionOrders.filter(order => {
            if (!distributionOrderDateFilter) return true;
            
            const orderDateParts = order.createdDate.split('/');
            const orderDateFormatted = `${orderDateParts[2]}-${orderDateParts[1].padStart(2, '0')}-${orderDateParts[0].padStart(2, '0')}`;
            
            return orderDateFormatted === distributionOrderDateFilter;
        }), [distributionOrders, distributionOrderDateFilter]
    );

    const getDistributionStatusColor = (status: DistributionOrder['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDistributionStatusIcon = (status: DistributionOrder['status']) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <FileX className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Đơn phân phát vật tư
                </h2>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Tìm theo ngày:</label>
                    <Input
                        type="date"
                        value={distributionOrderDateFilter}
                        onChange={(e) => setDistributionOrderDateFilter(e.target.value)}
                        className="w-36"
                        placeholder="Chọn ngày"
                    />
                    {distributionOrderDateFilter && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDistributionOrderDateFilter('')}
                            className="px-2 h-8"
                        >
                            ✕
                        </Button>
                    )}
                </div>
            </div>
            
            {filteredDistributionOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    {distributionOrderDateFilter ? 
                        `Không có đơn phân phát nào trong ngày ${formatDate(distributionOrderDateFilter)}` :
                        'Chưa có đơn phân phát vật tư nào'
                    }
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredDistributionOrders.map((order) => (
                        <Card key={order.id} className="p-4 bg-white shadow-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 mb-1">{order.materialName}</h3>
                                    <p className="text-xs text-gray-600">Tổng: {order.totalQuantity} {order.materialUnit}</p>
                                </div>
                                <Badge className={`${getDistributionStatusColor(order.status)} flex items-center text-xs`}>
                                    {getDistributionStatusIcon(order.status)}
                                    <span className="ml-1 font-medium">
                                        {order.status === 'pending' && 'Chờ xử lý'}
                                        {order.status === 'completed' && 'Thành công'}
                                        {order.status === 'rejected' && 'Không thành công'}
                                    </span>
                                </Badge>
                            </div>

                            <div className="space-y-1 text-xs mb-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Người tạo:</span>
                                    <span className="font-medium">{order.createdBy}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng số lượng:</span>
                                    <span className="font-medium text-blue-600">{formatNumber(order.totalQuantity.toString())} {order.materialUnit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số phòng phân phát:</span>
                                    <span className="font-medium">{Object.keys(order.distributions).filter(room => order.distributions[room] > 0).length} phòng</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Chi tiết phân phát:</span>
                                    <button
                                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center cursor-pointer text-xs"
                                        onClick={() => setExpandedDistributionDetails(prev => ({
                                            ...prev,
                                            [order.id]: !prev[order.id]
                                        }))}
                                    >
                                        Xem chi tiết ({Object.keys(order.distributions).filter(room => order.distributions[room] > 0).length} phòng)
                                        {expandedDistributionDetails[order.id] ? (
                                            <ChevronUp className="w-3 h-3 ml-1" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 ml-1" />
                                        )}
                                    </button>
                                </div>
                                
                                {expandedDistributionDetails[order.id] && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                        <div className="text-xs font-medium text-gray-700 mb-2">Phân phối chi tiết:</div>
                                        <div className="grid grid-cols-1 gap-1">
                                            {Object.entries(order.distributions)
                                                .filter(([_, quantity]) => quantity > 0)
                                                .map(([room, quantity]) => (
                                                    <div key={room} className="flex justify-between items-center py-1 px-2 bg-white rounded border border-gray-200">
                                                        <span className="text-gray-700 font-medium text-xs">{room}</span>
                                                        <span className="text-blue-600 font-semibold text-xs">
                                                            {formatNumber(quantity.toString())} {order.materialUnit}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-medium">{order.createdDate}</span>
                                </div>
                            </div>

                            {order.note && (
                                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-700"><strong>Ghi chú:</strong> {order.note}</p>
                                </div>
                            )}

                            {order.status === 'pending' && (
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
                                        onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                                        className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Thành công
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onUpdateOrderStatus(order.id, 'rejected')}
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

export default DistributionOrdersList; 
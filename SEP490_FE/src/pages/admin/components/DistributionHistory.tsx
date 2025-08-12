import React, { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { History, Calendar, Package, User, TrendingUp, TrendingDown } from 'lucide-react';

interface BatchInfo {
    transactionId: string;
    quantity: number;
}

interface RoomDetail {
    roomId: string;
    roomName: string;
    roomType: 'LABORATORY' | 'EXAMINATION';
    batchInfo: BatchInfo[];
}

interface DistributionHistoryItem {
    materialId: string;
    materialName: string;
    createdBy: string;
    createdAt: string;
    roomCount: number;
    roomDetails: RoomDetail[];
}

interface DistributionHistoryProps {
    historyItems: DistributionHistoryItem[];
    formatNumber: (value: string) => string;
    formatDate: (dateString: string) => string;
}

const DistributionHistory: React.FC<DistributionHistoryProps> = ({
    historyItems,
    formatNumber,
    formatDate
}) => {
    const [dateFilter, setDateFilter] = useState('');
    const [materialFilter, setMaterialFilter] = useState('');

    const filteredHistory = useMemo(() => 
        historyItems.filter(item => {
            // Date filter
            if (dateFilter) {
                const itemDate = new Date(item.createdAt);
                const filterDate = new Date(dateFilter);
                if (itemDate.toDateString() !== filterDate.toDateString()) return false;
            }
            
            // Material filter
            if (materialFilter && !item.materialName.toLowerCase().includes(materialFilter.toLowerCase())) return false;
            
            return true;
        }), [historyItems, dateFilter, materialFilter]
    );

    const totalDistributed = useMemo(() => 
        filteredHistory.reduce((sum, item) => {
            const itemTotal = item.roomDetails.reduce((roomSum, room) => 
                roomSum + room.batchInfo.reduce((batchSum, batch) => batchSum + batch.quantity, 0), 0
            );
            return sum + itemTotal;
        }, 0), [filteredHistory]
    );

    const totalRooms = useMemo(() => 
        filteredHistory.reduce((sum, item) => sum + item.roomDetails.length, 0), [filteredHistory]
    );

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <History className="w-5 h-5 mr-2 text-purple-600" />
                    Lịch sử phân phát
                </h2>
                <div className="flex items-center space-x-2">
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-36"
                        placeholder="Chọn ngày"
                    />

                    <Input
                        type="text"
                        placeholder="Tìm theo vật tư..."
                        value={materialFilter}
                        onChange={(e) => setMaterialFilter(e.target.value)}
                        className="w-48"
                    />
                    {(dateFilter || materialFilter) && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setDateFilter('');
                                setMaterialFilter('');
                            }}
                            className="px-2 h-8"
                        >
                            ✕
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center">
                        <Package className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Tổng đơn phân phát</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Tổng số lượng phân phát</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalDistributed.toString())}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center">
                        <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Tổng phòng được phân phát</p>
                            <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
                        </div>
                    </div>
                </Card>
            </div>
            
            {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {dateFilter || materialFilter ? 
                        'Không có lịch sử phân phát nào phù hợp với bộ lọc' :
                        'Chưa có lịch sử phân phát nào'
                    }
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((item) => {
                        const totalQuantity = item.roomDetails.reduce((sum, room) => 
                            sum + room.batchInfo.reduce((batchSum, batch) => batchSum + batch.quantity, 0), 0
                        );
                        
                        return (
                            <Card key={item.materialId} className="p-4 bg-white shadow-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-base text-gray-900 mb-1">{item.materialName}</h3>
                                        <p className="text-xs text-gray-600">Tổng phân phát: {formatNumber(totalQuantity.toString())} đơn vị</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800 flex items-center text-xs">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="ml-1 font-medium">Đã phân phát</span>
                                    </Badge>
                                </div>

                                <div className="space-y-1 text-xs mb-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người tạo:</span>
                                        <span className="font-medium">{item.createdBy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Thời gian tạo:</span>
                                        <span className="font-medium">{formatDateTime(item.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số phòng phân phát:</span>
                                        <span className="font-medium">{item.roomDetails.length} phòng</span>
                                    </div>
                                </div>

                                {/* Distribution details */}
                                {item.roomDetails.length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Chi tiết phân phát:</h4>
                                        <div className="space-y-2">
                                            {item.roomDetails.map((room) => {
                                                const roomTotal = room.batchInfo.reduce((sum, batch) => sum + batch.quantity, 0);
                                                return (
                                                    <div key={room.roomId} className="bg-white p-3 rounded border border-gray-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div>
                                                                <div className="font-semibold text-gray-900 text-sm">{room.roomName}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {room.roomType === 'LABORATORY' ? 'Phòng xét nghiệm' : 'Phòng khám'}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-blue-600">
                                                                    {formatNumber(roomTotal.toString())} đơn vị
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {room.batchInfo.length} lô hàng
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Batch details */}
                                                        <div className="mt-2 space-y-1">
                                                            {room.batchInfo.map((batch, index) => (
                                                                <div key={batch.transactionId} className="bg-gray-50 p-2 rounded">
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-600">Lô {index + 1}:</span>
                                                                        <span className="font-medium">{formatNumber(batch.quantity.toString())} đơn vị</span>
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        <span className="font-mono bg-white px-2 py-1 rounded border">
                                                                            ID: {batch.transactionId}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DistributionHistory; 
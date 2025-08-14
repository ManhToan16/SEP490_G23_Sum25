import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { History, User, TrendingUp } from 'lucide-react';

interface BatchInfo {
    transactionId: string;
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
    onSearch: (materialName?: string, roomName?: string) => void;
}

const DistributionHistory: React.FC<DistributionHistoryProps> = ({
    historyItems,
    formatNumber,
    formatDate,
    onSearch
}) => {
    const [materialFilter, setMaterialFilter] = useState('');
    const [roomFilter, setRoomFilter] = useState('');
    const [debouncedMaterialFilter, setDebouncedMaterialFilter] = useState('');
    const [debouncedRoomFilter, setDebouncedRoomFilter] = useState('');

    // Debounce material filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMaterialFilter(materialFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [materialFilter]);

    // Debounce room filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedRoomFilter(roomFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [roomFilter]);

    // Trigger search when debounced values change
    useEffect(() => {
        onSearch(debouncedMaterialFilter || undefined, debouncedRoomFilter || undefined);
    }, [debouncedMaterialFilter, debouncedRoomFilter, onSearch]);

    const handleMaterialSearch = (value: string) => {
        setMaterialFilter(value);
    };

    const handleRoomSearch = (value: string) => {
        setRoomFilter(value);
    };

    const clearFilters = () => {
        setMaterialFilter('');
        setRoomFilter('');
    };

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
                        type="text"
                        placeholder="Tìm theo vật tư..."
                        value={materialFilter}
                        onChange={(e) => handleMaterialSearch(e.target.value)}
                        className="w-48"
                    />

                    <Input
                        type="text"
                        placeholder="Tìm theo phòng..."
                        value={roomFilter}
                        onChange={(e) => handleRoomSearch(e.target.value)}
                        className="w-48"
                    />
                    {(materialFilter || roomFilter) && (
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

            {historyItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {materialFilter || roomFilter ? 
                        'Không có lịch sử phân phát nào phù hợp với bộ lọc' :
                        'Chưa có lịch sử phân phát nào'
                    }
                </div>
            ) : (
                <div className="space-y-4">
                    {historyItems.map((item) => {
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
                                                                <div className="flex items-center space-x-1 mt-1">
                                                                    {(() => {
                                                                        const approvedCount = room.batchInfo.filter(batch => batch.status === 'APPROVED').length;
                                                                        const pendingCount = room.batchInfo.filter(batch => batch.status === 'PENDING').length;
                                                                        const rejectedCount = room.batchInfo.filter(batch => batch.status === 'REJECTED').length;
                                                                        
                                                                        return (
                                                                            <>
                                                                                {approvedCount > 0 && (
                                                                                    <Badge variant="default" className="text-xs px-1 py-0 h-4">
                                                                                        ✓ {approvedCount}
                                                                                    </Badge>
                                                                                )}
                                                                                {pendingCount > 0 && (
                                                                                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                                                                        ⏳ {pendingCount}
                                                                                    </Badge>
                                                                                )}
                                                                                {rejectedCount > 0 && (
                                                                                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                                                                        ✗ {rejectedCount}
                                                                                    </Badge>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Batch details */}
                                                        <div className="mt-2 space-y-1">
                                                            {room.batchInfo.map((batch, index) => (
                                                                <div key={batch.transactionId} className="bg-gray-50 p-2 rounded">
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-gray-600">Lô {index + 1}:</span>
                                                                            <Badge 
                                                                                variant={batch.status === 'APPROVED' ? 'default' : batch.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                                                                className="text-xs px-1 py-0 h-4"
                                                                            >
                                                                                {batch.status === 'APPROVED' ? '✓ Đã duyệt' : 
                                                                                 batch.status === 'REJECTED' ? '✗ Từ chối' : '⏳ Chờ duyệt'}
                                                                            </Badge>
                                                                        </div>
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
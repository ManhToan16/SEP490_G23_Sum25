import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { adminService } from '@/shared/services/adminService';

interface Material {
    id: number;
    name: string;
    unit: string;
    totalQuantity: number;
    availableQuantity: number;
    description: string;
    category: string;
    minStockAlert: number;
    roomAllocations: Record<string, number>;
    batches: any[];
    totalValue: number;
    averagePrice: number;
}

interface ImportTransaction {
    id: string;
    materialId: string;
    materialName: string | null;
    transactionType: string;
    quantity: number;
    defectiveQuantity: number | null;
    roomId: string | null;
    roomType: string | null;
    userId: string;
    userName: string | null;
    reason: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    price: number;
    supplierId: string | null;
    supplierName: string | null;
    isEdit: boolean;
}

interface Room {
    id: string;
    name: string;
    description: string;
    type: 'EXAMINATION' | 'LABORATORY';
}

interface DistributionItem {
    roomId: string;
    roomName: string;
    transactionDistributions: {
        transactionId: string;
        transactionName: string;
        availableQuantity: number;
        quantity: number;
    }[];
    totalQuantity: number;
    maxQuantity: number;
}

interface DistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | null;
    onSuccess?: () => void;
}

const DistributionModal: React.FC<DistributionModalProps> = ({
    isOpen,
    onClose,
    material,
    onSuccess
}) => {
    const { toast } = useToast();
    
    // State
    const [importTransactions, setImportTransactions] = useState<ImportTransaction[]>([]);
    const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
    const [allRooms, setAllRooms] = useState<Room[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [totalQuantityToDistribute, setTotalQuantityToDistribute] = useState('');
    const [distributionItems, setDistributionItems] = useState<DistributionItem[]>([]);
    const [totalAvailableQuantity, setTotalAvailableQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDistributionForm, setShowDistributionForm] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [showAllRooms, setShowAllRooms] = useState(false);
 
    // Utility functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (dateString.includes('-') && dateString.length === 10) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatNumber = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
    };

    const parseNumber = (formattedValue: string) => {
        return formattedValue.replace(/[^\d]/g, '');
    };

    // Fetch import transactions for material
    const fetchImportTransactions = useCallback(async (materialId: string) => {
        try {
            const transactions = await adminService.getImportTransactionsForMaterial(materialId);
            setImportTransactions(transactions);
        } catch (error: any) {
            console.error('Error fetching import transactions:', error);
            toast({
                title: "Lỗi tải dữ liệu",
                description: error?.message || "Không thể tải danh sách nhập hàng",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Fetch all rooms
    const fetchAllRooms = useCallback(async () => {
        try {
            const [examRooms, labRooms] = await Promise.all([
                adminService.getExaminationRoomsForDistribution(),
                adminService.getLaboratoryRoomsForDistribution()
            ]);
            
            const allRoomsData = [
                ...examRooms.map((room: any) => ({ ...room, type: 'EXAMINATION' as const })),
                ...labRooms.map((room: any) => ({ ...room, type: 'LABORATORY' as const }))
            ];
            
            setAllRooms(allRoomsData);
        } catch (error: any) {
            console.error('Error fetching rooms:', error);
            toast({
                title: "Lỗi tải dữ liệu",
                description: error?.message || "Không thể tải danh sách phòng",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Calculate available quantity from selected transactions
    const calculateAvailableQuantity = useCallback(() => {
        const selectedTransactions = importTransactions.filter(t => selectedTransactionIds.includes(t.id));
        const totalQuantity = selectedTransactions.reduce((sum, t) => sum + t.quantity, 0);
        const totalDefective = selectedTransactions.reduce((sum, t) => sum + (t.defectiveQuantity || 0), 0);
        return totalQuantity - totalDefective;
    }, [importTransactions, selectedTransactionIds]);

    // Create distribution items with evenly distributed quantities
    const createDistributionItems = useCallback(() => {
        const availableQuantity = calculateAvailableQuantity();
        setTotalAvailableQuantity(availableQuantity);
        
        const quantityPerRoom = parseInt(parseNumber(totalQuantityToDistribute)) || 0;
        const roomCount = selectedRoomIds.length;
        
        if (roomCount === 0 || quantityPerRoom === 0) {
            setDistributionItems([]);
            return;
        }

        // Check if total quantity exceeds available quantity
        const totalQuantityNeeded = quantityPerRoom * roomCount;
        if (totalQuantityNeeded > availableQuantity) {
            toast({
                title: "Lỗi",
                description: `Tổng số lượng phân phát (${formatNumber(totalQuantityNeeded.toString())} ${material.unit}) vượt quá số lượng có sẵn (${formatNumber(availableQuantity.toString())} ${material.unit}). Vui lòng giảm số lượng cho mỗi phòng hoặc chọn ít phòng hơn.`,
                variant: "destructive",
            });
            return;
        }
        
        // Tự động phân bổ số lượng cho từng transaction
        const selectedTransactions = importTransactions.filter(t => selectedTransactionIds.includes(t.id));
        
        // Sắp xếp transactions theo số lượng có sẵn (giảm dần)
        const sortedTransactions = selectedTransactions
            .map(t => ({
                id: t.id,
                available: t.quantity - (t.defectiveQuantity || 0)
            }))
            .sort((a, b) => b.available - a.available);
        
        // Tính toán tổng số lượng cần phân phát
        const totalQuantityToAllocate = quantityPerRoom * roomCount;
        
        // Tạo map để theo dõi số lượng đã phân bổ cho từng transaction
        const transactionAllocation = new Map();
        selectedTransactionIds.forEach(id => {
            transactionAllocation.set(id, 0);
        });
        
        // Tạo map để lưu phân bổ cho từng phòng
        const roomAllocations = new Map();
        selectedRoomIds.forEach(roomId => {
            roomAllocations.set(roomId, new Map());
            selectedTransactionIds.forEach(transactionId => {
                roomAllocations.get(roomId).set(transactionId, 0);
            });
        });
        
        // Phân bổ thông minh: ưu tiên transaction có số lượng lớn trước
        let remainingQuantity = totalQuantityToAllocate;
        
        for (const sortedTrans of sortedTransactions) {
            const transactionId = sortedTrans.id;
            const availableForTransaction = sortedTrans.available;
            const alreadyAllocated = transactionAllocation.get(transactionId) || 0;
            const remainingForTransaction = availableForTransaction - alreadyAllocated;
            
            if (remainingForTransaction <= 0 || remainingQuantity <= 0) continue;
            
            // Phân bổ số lượng còn lại cho transaction này
            const toAllocate = Math.min(remainingForTransaction, remainingQuantity);
            
            // Phân bổ đều cho các phòng
            const quantityPerRoomForTransaction = Math.floor(toAllocate / roomCount);
            const extraQuantity = toAllocate % roomCount;
            
            selectedRoomIds.forEach((roomId, roomIndex) => {
                const allocationForThisRoom = quantityPerRoomForTransaction + (roomIndex < extraQuantity ? 1 : 0);
                roomAllocations.get(roomId).set(transactionId, allocationForThisRoom);
            });
            
            // Cập nhật số lượng đã phân bổ
            transactionAllocation.set(transactionId, alreadyAllocated + toAllocate);
            remainingQuantity -= toAllocate;
        }
        
        const items = selectedRoomIds.map((roomId) => {
            const room = allRooms.find(r => r.id === roomId);
            const roomAllocation = roomAllocations.get(roomId);
            
            const transactionDistributions = selectedTransactionIds.map(transactionId => {
                const transaction = importTransactions.find(t => t.id === transactionId);
                if (!transaction) return { transactionId, transactionName: 'Không rõ', availableQuantity: 0, quantity: 0 };
                
                const availableQuantity = transaction.quantity - (transaction.defectiveQuantity || 0);
                const allocatedQuantity = roomAllocation.get(transactionId) || 0;
                
                return {
                    transactionId,
                    transactionName: transaction.id.slice(0, 8),
                    availableQuantity,
                    quantity: allocatedQuantity
                };
            });
            
            const totalQuantity = transactionDistributions.reduce((sum, trans) => sum + trans.quantity, 0);
            
            return {
                roomId,
                roomName: room?.name || '',
                transactionDistributions,
                totalQuantity,
                maxQuantity: availableQuantity
            };
        });
        
        setDistributionItems(items);
        setShowDistributionForm(true);
    }, [selectedRoomIds, allRooms, calculateAvailableQuantity, totalQuantityToDistribute, toast, material, importTransactions, selectedTransactionIds]);

    // Load data when modal opens
    useEffect(() => {
        if (isOpen && material) {
            setLoading(true);
            Promise.all([
                fetchImportTransactions(material.id.toString()),
                fetchAllRooms()
            ]).finally(() => setLoading(false));
            
            // Reset state
            setSelectedTransactionIds([]);
            setSelectedRoomIds([]);
            setTotalQuantityToDistribute('');
            setDistributionItems([]);
            setTotalAvailableQuantity(0);
            setShowDistributionForm(false);
            setShowAllTransactions(false);
            setShowAllRooms(false);
        }
    }, [isOpen, material, fetchImportTransactions, fetchAllRooms]);

    // Reset form when selections change
    useEffect(() => {
        if (showDistributionForm) {
            setShowDistributionForm(false);
            setDistributionItems([]);
            setTotalQuantityToDistribute('');
        }
    }, [selectedTransactionIds, selectedRoomIds]);

    // Handle distribution
    const handleDistribute = async () => {
        if (!material) return;

        const totalDistributed = distributionItems.reduce((sum, item) => sum + item.totalQuantity, 0);
        
        if (totalDistributed <= 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập số lượng phân phát!",
                variant: "destructive",
            });
            return;
        }

        // Check if any room exceeds available quantity
        const exceededRooms = distributionItems.filter(item => item.totalQuantity > item.maxQuantity);
        if (exceededRooms.length > 0) {
            toast({
                title: "Lỗi",
                description: `Có ${exceededRooms.length} phòng vượt quá số lượng có sẵn. Vui lòng điều chỉnh trước khi phân phát.`,
                variant: "destructive",
            });
            return;
        }

        if (totalDistributed > totalAvailableQuantity) {
            toast({
                title: "Lỗi",
                description: "Số lượng phân phát vượt quá số lượng có sẵn!",
                variant: "destructive",
            });
            return;
        }

        // Tạo body API cho nhiều transactions và nhiều phòng
        const distributionBody = {
            transactions: selectedTransactionIds.map(transactionId => {
                const transaction = importTransactions.find(t => t.id === transactionId);
                const transactionName = transaction ? transaction.id.slice(0, 8) : 'Unknown';
                
                return {
                    transactionId: transactionId,
                    rooms: distributionItems
                        .filter(item => item.transactionDistributions.some(td => td.transactionId === transactionId && td.quantity > 0))
                        .map(item => {
                            const transDist = item.transactionDistributions.find(td => td.transactionId === transactionId);
                            return {
                                roomId: item.roomId,
                                quantity: transDist ? transDist.quantity : 0
                            };
                        })
                        .filter(room => room.quantity > 0)
                };
            }).filter(transaction => transaction.rooms.length > 0)
        };

        try {
            setLoading(true);
            
            // Gọi API để thực hiện phân phát
            await adminService.createProvideTransaction(distributionBody);

            toast({
                title: "Thành công",
                description: `Đã phân phát ${formatNumber(totalDistributed.toString())} ${material.unit} cho ${distributionItems.filter(item => item.totalQuantity > 0).length} phòng`,
            });

            // Reset state and close modal
            setSelectedTransactionIds([]);
            setSelectedRoomIds([]);
            setTotalQuantityToDistribute('');
            setDistributionItems([]);
            setTotalAvailableQuantity(0);
            setShowDistributionForm(false);
            onClose();
            
            // Call success callback
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error creating provide transaction:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể thực hiện phân phát vật tư",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!material) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Phân phát vật tư: {material.name}</DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Step 1 & 2: Chọn transactions và phòng */}
                        <div className="space-y-4">
                           
                            
                            {/* Row 2: Dropdowns và selections */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Chọn lô hàng nhập */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">Chọn lô hàng nhập</span>
                                        {selectedTransactionIds.length > 0 && (
                                            <span className="text-xs text-blue-600 font-medium">
                                                Đã chọn {selectedTransactionIds.length} lô | Tổng {formatNumber(calculateAvailableQuantity().toString())} {material.unit}
                                            </span>
                                        )}
                                    </div>
                                    <Select
                                        value=""
                                        onValueChange={(value) => {
                                            if (value && !selectedTransactionIds.includes(value)) {
                                                setSelectedTransactionIds(prev => [...prev, value]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Chọn lô hàng nhập..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {importTransactions.map((transaction) => {
                                                const isSelected = selectedTransactionIds.includes(transaction.id);
                                                const availableQuantity = transaction.quantity - (transaction.defectiveQuantity || 0);
                                                
                                                return (
                                                    <SelectItem 
                                                        key={transaction.id} 
                                                        value={transaction.id}
                                                        disabled={isSelected}
                                                        className={isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="font-medium">
                                                                ID: {transaction.id.slice(0, 8)}... - {formatNumber(availableQuantity.toString())} {material.unit}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Giá: {formatCurrency(transaction.price)} | Ngày: {formatDate(transaction.createdAt)}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Hiển thị danh sách đã chọn trong input style */}
                                    {selectedTransactionIds.length > 0 && (
                                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                                            <div className="flex flex-wrap gap-2">
                                                {(showAllTransactions ? selectedTransactionIds : selectedTransactionIds.slice(0, 4)).map((transactionId) => {
                                                    const transaction = importTransactions.find(t => t.id === transactionId);
                                                    if (!transaction) return null;
                                                    
                                                    const availableQuantity = transaction.quantity - (transaction.defectiveQuantity || 0);
                                                    
                                                    return (
                                                        <div key={transactionId} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                            <span className="mr-2">
                                                                {transaction.id.slice(0, 8)}... ({formatNumber(availableQuantity.toString())})
                                                            </span>
                                                            <button
                                                                onClick={() => setSelectedTransactionIds(prev => prev.filter(id => id !== transactionId))}
                                                                className="text-blue-600 hover:text-blue-800 font-bold"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {selectedTransactionIds.length > 4 && !showAllTransactions && (
                                                    <button
                                                        onClick={() => setShowAllTransactions(true)}
                                                        className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100"
                                                    >
                                                        +{selectedTransactionIds.length - 4} lô khác...
                                                    </button>
                                                )}
                                                {selectedTransactionIds.length > 4 && showAllTransactions && (
                                                    <button
                                                        onClick={() => setShowAllTransactions(false)}
                                                        className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100"
                                                    >
                                                        Thu gọn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Chọn phòng phân phát */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">Chọn phòng phân phát</span>
                                        {selectedRoomIds.length > 0 && (
                                            <span className="text-xs text-green-600 font-medium">
                                                Đã chọn {selectedRoomIds.length} phòng
                                            </span>
                                        )}
                                    </div>
                                    <Select
                                        value=""
                                        onValueChange={(value) => {
                                            if (value && !selectedRoomIds.includes(value)) {
                                                setSelectedRoomIds(prev => [...prev, value]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Chọn phòng phân phát..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allRooms.map((room) => {
                                                const isSelected = selectedRoomIds.includes(room.id);
                                                
                                                return (
                                                    <SelectItem 
                                                        key={room.id} 
                                                        value={room.id}
                                                        disabled={isSelected}
                                                        className={isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="font-medium">
                                                                {room.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {room.description} | {room.type === 'EXAMINATION' ? 'Phòng khám' : 'Phòng xét nghiệm'}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Hiển thị danh sách phòng đã chọn trong input style */}
                                    {selectedRoomIds.length > 0 && (
                                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                                            <div className="flex flex-wrap gap-2">
                                                {(showAllRooms ? selectedRoomIds : selectedRoomIds.slice(0, 4)).map((roomId) => {
                                                    const room = allRooms.find(r => r.id === roomId);
                                                    if (!room) return null;
                                                    
                                                    return (
                                                        <div key={roomId} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                            <span className="mr-2">
                                                                {room.name} ({room.type === 'EXAMINATION' ? 'Khám' : 'Xét nghiệm'})
                                                            </span>
                                                            <button
                                                                onClick={() => setSelectedRoomIds(prev => prev.filter(id => id !== roomId))}
                                                                className="text-green-600 hover:text-green-800 font-bold"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {selectedRoomIds.length > 4 && !showAllRooms && (
                                                    <button
                                                        onClick={() => setShowAllRooms(true)}
                                                        className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-100"
                                                    >
                                                        +{selectedRoomIds.length - 4} phòng khác...
                                                    </button>
                                                )}
                                                {selectedRoomIds.length > 4 && showAllRooms && (
                                                    <button
                                                        onClick={() => setShowAllRooms(false)}
                                                        className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-100"
                                                    >
                                                        Thu gọn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Nhập số lượng tổng và phân bổ */}
                        {selectedRoomIds.length > 0 && !showDistributionForm && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">Nhập số lượng phân phát</h3>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-3">
                                        Số lượng cho mỗi phòng trong {selectedRoomIds.length} phòng đã chọn
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                placeholder="VD: 100"
                                                value={totalQuantityToDistribute ? formatNumber(totalQuantityToDistribute) : ''}
                                                onChange={(e) => {
                                                    const numericValue = parseNumber(e.target.value);
                                                    setTotalQuantityToDistribute(numericValue);
                                                }}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <Button 
                                            onClick={createDistributionItems}
                                            disabled={!totalQuantityToDistribute || parseInt(parseNumber(totalQuantityToDistribute)) <= 0}
                                            className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-sm"
                                        >
                                            Thêm
                                        </Button>
                                    </div>
                                    {totalQuantityToDistribute && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Tổng sẽ phân phát: {formatNumber((parseInt(parseNumber(totalQuantityToDistribute)) * selectedRoomIds.length).toString())} {material.unit}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Chỉnh sửa số lượng từng phòng */}
                        {showDistributionForm && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa số lượng từng phòng</h3>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            setShowDistributionForm(false);
                                            setDistributionItems([]);
                                        }}
                                        className="h-8 px-3 text-xs"
                                    >
                                        Quay lại nhập số lượng
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-4">
                                        {distributionItems.map((item, roomIndex) => {
                                            const isExceeded = item.totalQuantity > item.maxQuantity;
                                            return (
                                                <div key={item.roomId} className={`p-4 rounded-lg border ${isExceeded ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{item.roomName}</div>
                                                                <div className="text-xs text-gray-600">
                                                                    {item.roomId.slice(0, 8)}... | Tối đa: {formatNumber(item.maxQuantity.toString())} {material.unit}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    Tổng: {formatNumber(item.totalQuantity.toString())} {material.unit}
                                                                </div>
                                                                {isExceeded && (
                                                                    <div className="text-xs text-red-600">
                                                                        ⚠️ Vượt quá {formatNumber((item.totalQuantity - item.maxQuantity).toString())} {material.unit}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {item.transactionDistributions.map((transDist, transIndex) => {
                                                                // Tính tổng số lượng của transaction này đã được phân phát
                                                                const totalForTransaction = distributionItems.reduce((sum, roomItem) => {
                                                                    const transInRoom = roomItem.transactionDistributions.find(t => t.transactionId === transDist.transactionId);
                                                                    return sum + (transInRoom ? transInRoom.quantity : 0);
                                                                }, 0);
                                                                
                                                                const isExceeded = transDist.quantity > transDist.availableQuantity;
                                                                const isTotalExceeded = totalForTransaction > transDist.availableQuantity;
                                                                
                                                                return (
                                                                    <div key={transDist.transactionId} className={`bg-white p-3 rounded border ${isExceeded || isTotalExceeded ? 'border-red-200 bg-red-50' : ''}`}>
                                                                        <div className="space-y-2">
                                                                            <div className="text-xs font-medium text-gray-700">
                                                                                Lô: {transDist.transactionName}...
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Có sẵn: {formatNumber(transDist.availableQuantity.toString())} {material.unit}
                                                                            </div>
                                                                            <div className="text-xs text-blue-600">
                                                                                Tổng đã phân phát: {formatNumber(totalForTransaction.toString())} {material.unit}
                                                                            </div>
                                                                            {isExceeded && (
                                                                                <div className="text-xs text-red-600">
                                                                                    ⚠️ Vượt quá {formatNumber((transDist.quantity - transDist.availableQuantity).toString())} {material.unit}
                                                                                </div>
                                                                            )}
                                                                            {isTotalExceeded && !isExceeded && (
                                                                                <div className="text-xs text-red-600">
                                                                                    ⚠️ Tổng phân phát vượt quá {formatNumber((totalForTransaction - transDist.availableQuantity).toString())} {material.unit}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="w-full">
                                                                            <Input
                                                                                type="text"
                                                                                placeholder="0"
                                                                                value={formatNumber(transDist.quantity.toString())}
                                                                                onChange={(e) => {
                                                                                    const numericValue = parseNumber(e.target.value);
                                                                                    const quantity = parseInt(numericValue) || 0;
                                                                                    
                                                                                    // Validation: Không vượt quá số lượng có sẵn của transaction
                                                                                    if (quantity > transDist.availableQuantity) {
                                                                                        toast({
                                                                                            title: "Lỗi",
                                                                                            description: `Số lượng vượt quá số lượng có sẵn của lô ${transDist.transactionName} (${formatNumber(transDist.availableQuantity.toString())} ${material.unit})`,
                                                                                            variant: "destructive",
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    
                                                                                    // Validation: Kiểm tra tổng số lượng của transaction này đã được phân phát
                                                                                    const currentTotalForTransaction = distributionItems.reduce((sum, roomItem) => {
                                                                                        const transInRoom = roomItem.transactionDistributions.find(t => t.transactionId === transDist.transactionId);
                                                                                        return sum + (transInRoom ? transInRoom.quantity : 0);
                                                                                    }, 0);
                                                                                    
                                                                                    // Tính tổng mới nếu thay đổi số lượng này
                                                                                    const newTotalForTransaction = currentTotalForTransaction - transDist.quantity + quantity;
                                                                                    
                                                                                    if (newTotalForTransaction > transDist.availableQuantity) {
                                                                                        toast({
                                                                                            title: "Lỗi",
                                                                                            description: `Tổng số lượng phân phát của lô ${transDist.transactionName} sẽ vượt quá số lượng có sẵn (${formatNumber(transDist.availableQuantity.toString())} ${material.unit}). Hiện tại: ${formatNumber(currentTotalForTransaction.toString())}, Sau khi thay đổi: ${formatNumber(newTotalForTransaction.toString())}`,
                                                                                            variant: "destructive",
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    
                                                                                    setDistributionItems(prev => 
                                                                                        prev.map((roomItem, i) => 
                                                                                            i === roomIndex 
                                                                                                ? {
                                                                                                    ...roomItem,
                                                                                                    transactionDistributions: roomItem.transactionDistributions.map((trans, j) => 
                                                                                                        j === transIndex 
                                                                                                            ? { ...trans, quantity }
                                                                                                            : trans
                                                                                                    ),
                                                                                                    totalQuantity: roomItem.transactionDistributions.reduce((sum, trans, j) => 
                                                                                                        sum + (j === transIndex ? quantity : trans.quantity), 0
                                                                                                    )
                                                                                                }
                                                                                                : roomItem
                                                                                        )
                                                                                    );
                                                                                }}
                                                                                className={`text-right h-8 text-sm ${isExceeded || isTotalExceeded ? 'border-red-300 focus:border-red-500' : ''}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="bg-yellow-50 p-2 rounded-lg">
                                        <div className="text-sm text-yellow-800">
                                            <strong>Tổng phân phát:</strong> {formatNumber(distributionItems.reduce((sum, item) => sum + item.totalQuantity, 0).toString())} {material.unit}
                                        </div>
                                        {distributionItems.some(item => item.totalQuantity > item.maxQuantity) && (
                                            <div className="text-xs text-red-600 mt-1">
                                                ⚠️ Có phòng vượt quá số lượng có sẵn. Vui lòng điều chỉnh trước khi phân phát.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end space-x-2">
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                            >
                                Hủy
                            </Button>
                            {showDistributionForm && (
                                <Button 
                                    onClick={handleDistribute} 
                                    disabled={
                                        distributionItems.length === 0 || 
                                        distributionItems.every(item => item.totalQuantity === 0) ||
                                        distributionItems.some(item => item.totalQuantity > item.maxQuantity) ||
                                        distributionItems.some(item => 
                                            item.transactionDistributions.some(trans => trans.quantity > trans.availableQuantity)
                                        ) ||
                                        distributionItems.some(item => 
                                            item.transactionDistributions.some(trans => {
                                                const totalForTransaction = distributionItems.reduce((sum, roomItem) => {
                                                    const transInRoom = roomItem.transactionDistributions.find(t => t.transactionId === trans.transactionId);
                                                    return sum + (transInRoom ? transInRoom.quantity : 0);
                                                }, 0);
                                                return totalForTransaction > trans.availableQuantity;
                                            })
                                        )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Xác nhận phân phát
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DistributionModal;

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/components/ui/use-toast';
import { adminService } from '@/shared/services/adminService';
import { Card } from '@/shared/components/ui/card';
import { Edit2, Trash2, Package, DollarSign, Calendar, AlertTriangle, CheckCircle, Save, X } from 'lucide-react';

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

interface ImportHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | null;
    onSuccess?: () => void;
}

const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
    isOpen,
    onClose,
    material,
    onSuccess
}) => {
    const { toast } = useToast();
    
    // State
    const [importHistory, setImportHistory] = useState<ImportTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        quantity: '',
        defectiveQuantity: '',
        price: '',
        reason: ''
    });

    // Utility functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (dateString.includes('/')) {
            return dateString; // Already formatted
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

    const calculateAvailableQuantity = (quantity: number, defectiveQuantity: number | null) => {
        return Math.max(0, quantity - (defectiveQuantity || 0));
    };

    // Fetch import history
    const fetchImportHistory = useCallback(async (materialId: string) => {
        try {
            setLoading(true);
            const history = await adminService.getImportHistory(materialId);
            setImportHistory(history);
        } catch (error: any) {
            console.error('Error fetching import history:', error);
            toast({
                title: "Lỗi tải dữ liệu",
                description: error?.message || "Không thể tải lịch sử nhập hàng",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Load data when modal opens
    useEffect(() => {
        if (isOpen && material) {
            fetchImportHistory(material.id.toString());
            // Reset editing state
            setEditingTransaction(null);
            setEditFormData({
                quantity: '',
                defectiveQuantity: '',
                price: '',
                reason: ''
            });
        }
    }, [isOpen, material, fetchImportHistory]);

    // Handle edit transaction
    const handleEditTransaction = (transaction: ImportTransaction) => {
        setEditingTransaction(transaction.id);
        setEditFormData({
            quantity: transaction.quantity.toString(),
            defectiveQuantity: (transaction.defectiveQuantity || 0).toString(),
            price: transaction.price.toString(),
            reason: transaction.reason
        });
    };

    const handleCancelEdit = () => {
        setEditingTransaction(null);
        setEditFormData({
            quantity: '',
            defectiveQuantity: '',
            price: '',
            reason: ''
        });
    };

    const handleSaveEdit = async (transactionId: string) => {
        try {
            const quantity = parseInt(parseNumber(editFormData.quantity)) || 0;
            const defectiveQuantity = parseInt(parseNumber(editFormData.defectiveQuantity)) || 0;
            const price = parseFloat(parseNumber(editFormData.price)) || 0;

            // Validation
            if (quantity <= 0) {
                toast({
                    title: "Lỗi",
                    description: "Số lượng phải lớn hơn 0",
                    variant: "destructive",
                });
                return;
            }

            if (defectiveQuantity > quantity) {
                toast({
                    title: "Lỗi",
                    description: "Số lượng lỗi không thể lớn hơn số lượng nhập hàng",
                    variant: "destructive",
                });
                return;
            }

            if (price <= 0) {
                toast({
                    title: "Lỗi",
                    description: "Giá phải lớn hơn 0",
                    variant: "destructive",
                });
                return;
            }

            setLoading(true);

            const updateData = {
                quantity,
                defectiveQuantity,
                price,
                reason: editFormData.reason
            };

            await adminService.updateImportTransaction(transactionId, updateData);

            toast({
                title: "Thành công",
                description: "Đã cập nhật thông tin lô hàng",
            });

            // Refresh data
            if (material) {
                await fetchImportHistory(material.id.toString());
            }
            
            handleCancelEdit();
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error updating import transaction:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể cập nhật thông tin lô hàng",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lô hàng này?')) {
            return;
        }

        try {
            setLoading(true);
            await adminService.deleteImportTransaction(transactionId);

            toast({
                title: "Thành công",
                description: "Đã xóa lô hàng",
            });

            // Refresh data
            if (material) {
                await fetchImportHistory(material.id.toString());
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error deleting import transaction:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể xóa lô hàng",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!material) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center">
                        <Package className="w-6 h-6 mr-2 text-blue-600" />
                        Lịch sử nhập hàng: {material.name}
                    </DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Tổng lô hàng:</span>
                                    <div className="font-semibold text-blue-800">{importHistory.length} lô</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tổng số lượng:</span>
                                    <div className="font-semibold text-blue-800">
                                        {formatNumber(importHistory.reduce((sum, item) => sum + item.quantity, 0).toString())} {material.unit}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số lượng lỗi:</span>
                                    <div className="font-semibold text-red-600">
                                        {formatNumber(importHistory.reduce((sum, item) => sum + (item.defectiveQuantity || 0), 0).toString())} {material.unit}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tổng giá trị:</span>
                                    <div className="font-semibold text-green-600">
                                        {formatCurrency(importHistory.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Import History List */}
                        <div className="space-y-3">
                            {importHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có lịch sử nhập hàng</p>
                                </div>
                            ) : (
                                importHistory.map((transaction) => {
                                    const isEditing = editingTransaction === transaction.id;
                                    const availableQuantity = calculateAvailableQuantity(transaction.quantity, transaction.defectiveQuantity);

                                    return (
                                        <Card key={transaction.id} className="p-4">
                                            <div className="space-y-3">
                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            ID: {transaction.id.slice(0, 8)}...
                                                        </div>
                                                        <Badge variant={transaction.status === 'APPROVED' ? 'default' : 'secondary'}>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            {transaction.status}
                                                        </Badge>
                                                        {transaction.isEdit && (
                                                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                                Có thể chỉnh sửa
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {transaction.isEdit && !isEditing && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditTransaction(transaction)}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                                    className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {isEditing && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleSaveEdit(transaction.id)}
                                                                    disabled={loading}
                                                                    className="h-8 px-2 text-green-600 border-green-300 hover:bg-green-50"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleCancelEdit}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                {isEditing ? (
                                                    /* Edit Form */
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Số lượng *</label>
                                                            <Input
                                                                type="text"
                                                                value={editFormData.quantity ? formatNumber(editFormData.quantity) : ''}
                                                                onChange={(e) => {
                                                                    const numericValue = parseNumber(e.target.value);
                                                                    setEditFormData(prev => ({ ...prev, quantity: numericValue }));
                                                                }}
                                                                className="h-9 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Số lượng lỗi</label>
                                                            <Input
                                                                type="text"
                                                                value={editFormData.defectiveQuantity ? formatNumber(editFormData.defectiveQuantity) : ''}
                                                                onChange={(e) => {
                                                                    const numericValue = parseNumber(e.target.value);
                                                                    setEditFormData(prev => ({ ...prev, defectiveQuantity: numericValue }));
                                                                }}
                                                                className="h-9 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Giá (VND) *</label>
                                                            <Input
                                                                type="text"
                                                                value={editFormData.price ? formatNumber(editFormData.price) : ''}
                                                                onChange={(e) => {
                                                                    const numericValue = parseNumber(e.target.value);
                                                                    setEditFormData(prev => ({ ...prev, price: numericValue }));
                                                                }}
                                                                className="h-9 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Lý do</label>
                                                            <Input
                                                                type="text"
                                                                value={editFormData.reason}
                                                                onChange={(e) => setEditFormData(prev => ({ ...prev, reason: e.target.value }))}
                                                                className="h-9 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Display Mode */
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-gray-500">Số lượng nhập</div>
                                                            <div className="flex items-center space-x-2">
                                                                <Package className="w-4 h-4 text-blue-600" />
                                                                <span className="font-medium">{formatNumber(transaction.quantity.toString())} {material.unit}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-gray-500">Số lượng lỗi</div>
                                                            <div className="flex items-center space-x-2">
                                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                                <span className="font-medium text-red-600">
                                                                    {formatNumber((transaction.defectiveQuantity || 0).toString())} {material.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-gray-500">Số lượng có sẵn</div>
                                                            <div className="flex items-center space-x-2">
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                                <span className="font-medium text-green-600">
                                                                    {formatNumber(availableQuantity.toString())} {material.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-gray-500">Giá nhập</div>
                                                            <div className="flex items-center space-x-2">
                                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                                <span className="font-medium">{formatCurrency(transaction.price)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Ngày tạo: {formatDate(transaction.createdAt)}</span>
                                                        </div>
                                                        {transaction.reason && (
                                                            <div>
                                                                <span className="font-medium">Lý do:</span> {transaction.reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Tổng giá trị: <span className="font-medium text-green-600">
                                                            {formatCurrency(transaction.price * transaction.quantity)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImportHistoryModal;

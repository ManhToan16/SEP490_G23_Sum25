import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Plus, Package, AlertTriangle, Edit2, Truck, DollarSign, RefreshCw, FileX, CheckCircle, Clock, Edit, Search, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';
import { adminService } from '@/shared/services/adminService';

// Import components
import MaterialsList from './components/MaterialsList';
import DefectiveOrdersList from './components/DefectiveOrdersList';
import DistributionHistory from './components/DistributionHistory';
import DistributionModal from './components/DistributionModal';

const mockRooms = ['Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng cấp cứu', 'Phòng xét nghiệm'];

interface Batch {
    id: string;
    batchNumber: string;
    purchasePrice: number;
    quantity: number;
    defectiveQuantity: number;
    expiryDate: string;
    purchaseDate: string;
    purchaseTime: string;
    supplier: string;
}

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
    batches: Batch[];
    totalValue: number;
    averagePrice: number;
}

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



const mockMaterials: Material[] = [
    {
        id: 1,
        name: 'Găng tay y tế',
        unit: 'hộp',
        totalQuantity: 1000,
        availableQuantity: 650,
        description: 'Găng tay cao su dùng 1 lần',
        category: 'Bảo hộ',
        minStockAlert: 100,
        roomAllocations: {
            'Phòng 1': 200,
            'Phòng 2': 150,
            'Phòng 3': 0,
            'Phòng cấp cứu': 0,
            'Phòng xét nghiệm': 0
        },
        batches: [
            {
                id: 'batch1',
                batchNumber: 'LOT-2024-001',
                purchasePrice: 50000,
                quantity: 500,
                defectiveQuantity: 10,
                expiryDate: '2025-12-31',
                purchaseDate: '2024-01-15',
                purchaseTime: '09:30',
                supplier: 'Công ty ABC'
            },
            {
                id: 'batch2',
                batchNumber: 'LOT-2024-002',
                purchasePrice: 52000,
                quantity: 500,
                defectiveQuantity: 5,
                expiryDate: '2025-06-30',
                purchaseDate: '2024-02-20',
                purchaseTime: '14:15',
                supplier: 'Công ty XYZ'
            }
        ],
        totalValue: 51000000,
        averagePrice: 51000
    },
    {
        id: 2,
        name: 'Máy đo huyết áp',
        unit: 'máy',
        totalQuantity: 10,
        availableQuantity: 6,
        description: 'Máy đo huyết áp điện tử',
        category: 'Thiết bị',
        minStockAlert: 2,
        roomAllocations: {
            'Phòng 1': 2,
            'Phòng 2': 2,
            'Phòng 3': 0,
            'Phòng cấp cứu': 0,
            'Phòng xét nghiệm': 0
        },
        batches: [
            {
                id: 'batch3',
                batchNumber: 'BP-2024-001',
                purchasePrice: 1500000,
                quantity: 10,
                defectiveQuantity: 0,
                expiryDate: '2027-01-01',
                purchaseDate: '2024-01-10',
                purchaseTime: '10:45',
                supplier: 'Medical Equipment Co.'
            }
        ],
        totalValue: 15000000,
        averagePrice: 1500000
    }
];

const DistributionMaterialManagement = () => {
    const { toast } = useToast();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showDefectiveModal, setShowDefectiveModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [defectiveOrders, setDefectiveOrders] = useState<DefectiveReturnOrder[]>([]);

    const [batchData, setBatchData] = useState({
        price: '',
        quantity: '',
        defectiveQuantity: '',
        importDate: '',
        importTime: '',
        reason: ''
    });

    const [distributionData, setDistributionData] = useState<Record<string, number>>({});
    

    
    const [defectiveFormData, setDefectiveFormData] = useState({
        quantity: '',
        reason: '',
        note: '',
        selectedBatchId: ''
    });

    // State for distribution history from API
    const [distributionHistory, setDistributionHistory] = useState([]);

    // State for import history
    const [importHistoryByMaterial, setImportHistoryByMaterial] = useState<Record<string, any[]>>({});

    const [showEditDefectiveModal, setShowEditDefectiveModal] = useState(false);
    const [editingDefectiveOrder, setEditingDefectiveOrder] = useState<DefectiveReturnOrder | null>(null);
    
    // Lazy loading states for modals
    const [isModalContentLoaded, setIsModalContentLoaded] = useState(false);
    
    // State cho active tab
    const [activeTab, setActiveTab] = useState('materials');

    // Fetch materials from API
    const fetchMaterials = useCallback(async () => {
        try {
            setLoading(true);
            const materialsData = await adminService.getMaterialImportSummary();
            console.log('Fetched materials:', materialsData);
            setMaterials(materialsData);
        } catch (error: any) {
            console.error('Error fetching materials:', error);
            toast({
                title: "Lỗi tải dữ liệu",
                description: error?.message || "Không thể tải danh sách vật tư",
                variant: "destructive",
            });
            // Fallback to mock data if API fails
            setMaterials(mockMaterials);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch distribution history from API
    const fetchDistributionHistory = useCallback(async (materialName?: string, roomName?: string) => {
        try {
            const historyData = await adminService.getProvideHistories(materialName, roomName);
            console.log('Fetched distribution history:', historyData);
            setDistributionHistory(historyData);
        } catch (error: any) {
            console.error('Error fetching distribution history:', error);
            toast({
                title: "Lỗi tải lịch sử",
                description: error?.message || "Không thể tải lịch sử phân phát",
                variant: "destructive",
            });
            // Keep empty array if API fails
            setDistributionHistory([]);
        }
    }, [toast]);

    // Fetch defective orders from API
    const fetchDefectiveOrders = useCallback(async () => {
        try {
            const defectiveData = await adminService.getDefectiveBatches();
            console.log('Fetched defective orders:', defectiveData);
            setDefectiveOrders(defectiveData);
        } catch (error: any) {
            console.error('Error fetching defective orders:', error);
            toast({
                title: "Lỗi tải đơn hàng lỗi",
                description: error?.message || "Không thể tải danh sách đơn hàng lỗi",
                variant: "destructive",
            });
            // Keep empty array if API fails
            setDefectiveOrders([]);
        }
    }, [toast]);

    // Handle history search
    const handleHistorySearch = useCallback((materialName?: string, roomName?: string) => {
        fetchDistributionHistory(materialName, roomName);
    }, [fetchDistributionHistory]);

    // Fetch import history for a material
    const fetchImportHistory = useCallback(async (materialId: string) => {
        try {
            const history = await adminService.getImportHistory(materialId);
            setImportHistoryByMaterial(prev => ({
                ...prev,
                [materialId]: history
            }));
        } catch (error: any) {
            console.error('Error fetching import history:', error);
            toast({
                title: "Lỗi tải lịch sử",
                description: error?.message || "Không thể tải lịch sử nhập hàng",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Update import transaction
    const updateImportTransaction = useCallback(async (transactionId: string, data: any) => {
        try {
            await adminService.updateImportTransaction(transactionId, data);
            
            // Refresh import history for all materials that might be affected
            const materialIds = Object.keys(importHistoryByMaterial);
            for (const materialId of materialIds) {
                await fetchImportHistory(materialId);
            }
            
            // Also refresh materials data
            await fetchMaterials();
        } catch (error: any) {
            console.error('Error updating import transaction:', error);
            throw error;
        }
    }, [importHistoryByMaterial, fetchImportHistory, fetchMaterials]);

    // Delete import transaction
    const deleteImportTransaction = useCallback(async (transactionId: string) => {
        try {
            await adminService.deleteImportTransaction(transactionId);
            
            // Refresh import history for all materials that might be affected
            const materialIds = Object.keys(importHistoryByMaterial);
            for (const materialId of materialIds) {
                await fetchImportHistory(materialId);
            }
            
            // Also refresh materials data
            await fetchMaterials();
        } catch (error: any) {
            console.error('Error deleting import transaction:', error);
            throw error;
        }
    }, [importHistoryByMaterial, fetchImportHistory, fetchMaterials]);

    // Update defective quantity
    const updateDefectiveQuantity = useCallback(async (transactionId: string, newDefectiveQuantity: number) => {
        try {
            await adminService.updateDefectiveTransaction(transactionId, newDefectiveQuantity);
            
            // Refresh defective orders
            await fetchDefectiveOrders();
            
            // Also refresh materials data
            await fetchMaterials();
            
            toast({
                title: "Thành công",
                description: "Đã cập nhật số lượng lỗi",
            });
        } catch (error: any) {
            console.error('Error updating defective quantity:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể cập nhật số lượng lỗi",
                variant: "destructive",
            });
            throw error;
        }
    }, [fetchDefectiveOrders, fetchMaterials, toast]);

    // Approve supplier return
    const approveSupplierReturn = useCallback(async (transactionId: string) => {
        try {
            await adminService.approveSupplierReturn(transactionId);
            
            // Refresh defective orders
            await fetchDefectiveOrders();
            
            toast({
                title: "Thành công",
                description: "Đã duyệt đơn đổi trả",
            });
        } catch (error: any) {
            console.error('Error approving supplier return:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể duyệt đơn đổi trả",
                variant: "destructive",
            });
            throw error;
        }
    }, [fetchDefectiveOrders, toast]);

    // Reject supplier return
    const rejectSupplierReturn = useCallback(async (transactionId: string) => {
        try {
            await adminService.rejectSupplierReturn(transactionId);
            
            // Refresh defective orders
            await fetchDefectiveOrders();
            
            toast({
                title: "Thành công",
                description: "Đã từ chối đơn đổi trả",
            });
        } catch (error: any) {
            console.error('Error rejecting supplier return:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể từ chối đơn đổi trả",
                variant: "destructive",
            });
            throw error;
        }
    }, [fetchDefectiveOrders, toast]);



    // Load materials, distribution history and defective orders on component mount
    useEffect(() => {
        fetchMaterials();
        fetchDistributionHistory();
        fetchDefectiveOrders();
    }, [fetchMaterials, fetchDistributionHistory, fetchDefectiveOrders]);



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

    // Helper function to calculate available quantity
    const calculateAvailableQuantityFromBatch = (quantity: number, defectiveQuantity: number) => {
        return Math.max(0, quantity - defectiveQuantity);
    };

    // Modal handlers
    const openDefectiveModal = useCallback((material: Material, batch?: Batch) => {
        // Immediate UI feedback - show modal shell first
        setShowDefectiveModal(true);
        
        // Defer heavy calculations to next frame
        requestAnimationFrame(() => {
            const availableBatches = material.batches.filter(b => {
                            const processedQuantity = defectiveOrders
                .filter(order => order.materialId === material.id.toString() && order.status === 'APPROVED')
                .reduce((sum, order) => sum + order.quantity, 0);
            return (b.defectiveQuantity - processedQuantity) > 0;
            });
            
            const initialBatchId = batch?.id || (availableBatches.length === 1 ? availableBatches[0].id : '');
            const selectedBatchForModal = initialBatchId ? material.batches.find(b => b.id === initialBatchId) : null;
            
            setSelectedMaterial(material);
            setSelectedBatch(selectedBatchForModal || batch || null);
            setDefectiveFormData({
                quantity: '',
                reason: '',
                note: '',
                selectedBatchId: initialBatchId
            });
            
            // Load modal content after state is set
            requestAnimationFrame(() => {
                setIsModalContentLoaded(true);
            });
        });
    }, [defectiveOrders]);

    const openDistributeModal = useCallback((material: Material) => {
        setSelectedMaterial(material);
        setShowDistributeModal(true);
    }, []);

    const openBatchModal = useCallback((material: Material) => {
        // Immediate modal display
        setShowBatchModal(true);
        
        // Defer expensive operations to next frame
        requestAnimationFrame(() => {
            const currentDate = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().slice(0, 5);
            
            setSelectedMaterial(material);
            setBatchData({
                price: '',
                quantity: '',
                defectiveQuantity: '',
                importDate: currentDate,
                importTime: currentTime,
                reason: ''
            });
            
            setIsModalContentLoaded(true);
        });
    }, [materials]);

    const openEditDefectiveModal = useCallback((order: DefectiveReturnOrder) => {
        const material = materials.find(m => m.id.toString() === order.materialId);
        
        setEditingDefectiveOrder(order);
        setSelectedMaterial(material || null);
        setDefectiveFormData({
            quantity: order.quantity.toString(),
            reason: order.reason,
            note: '',
            selectedBatchId: ''
        });
        setShowEditDefectiveModal(true);
    }, [materials]);

    // Action handlers
    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;

        // Validate required fields
        if (!batchData.price || !batchData.quantity || !batchData.importDate) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ giá, số lượng và ngày nhập hàng",
                variant: "destructive",
            });
            return;
        }

        // Validate quantity values
        const quantity = parseInt(batchData.quantity);
        const defectiveQuantity = parseInt(batchData.defectiveQuantity) || 0;
        
        if (quantity <= 0) {
            toast({
                title: "Số lượng không hợp lệ",
                description: "Số lượng nhập hàng phải lớn hơn 0",
                variant: "destructive",
            });
            return;
        }
        
        if (defectiveQuantity > quantity) {
            toast({
                title: "Số lượng không hợp lệ",
                description: "Số lượng lỗi không thể lớn hơn số lượng nhập hàng",
                variant: "destructive",
            });
            return;
        }

        if (defectiveQuantity < 0) {
            toast({
                title: "Số lượng không hợp lệ",
                description: "Số lượng lỗi không thể âm",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            
            // Combine date and time into ISO string
            const importDateTime = batchData.importTime 
                ? `${batchData.importDate}T${batchData.importTime}:00`
                : `${batchData.importDate}T00:00:00`;
            
            const importData = {
                materialId: selectedMaterial.id.toString(),
                price: parseFloat(batchData.price),
                quantity: parseInt(batchData.quantity),
                defectiveQuantity: parseInt(batchData.defectiveQuantity) || 0,
                reason: batchData.reason || 'Nhập hàng mới',
                importDate: new Date(importDateTime).toISOString()
            };

            await adminService.createImportTransaction(importData);
            
            toast({
                title: "Thành công",
                description: "Đã tạo phiếu nhập hàng thành công",
            });

            // Refresh materials data
            await fetchMaterials();
            
            setShowBatchModal(false);
            setBatchData({
                price: '',
                quantity: '',
                defectiveQuantity: '',
                importDate: '',
                importTime: '',
                reason: ''
            });
        } catch (error: any) {
            console.error('Error creating import transaction:', error);
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể tạo phiếu nhập hàng",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDistributionSuccess = () => {
        // Refresh materials data after successful distribution
        fetchMaterials();
    };

    const handleCreateDefectiveOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial || !defectiveFormData.selectedBatchId) {
            alert('Vui lòng chọn vật tư và lô hàng!');
            return;
        }

        const selectedBatchForOrder = selectedMaterial.batches.find(b => b.id === defectiveFormData.selectedBatchId);
        if (!selectedBatchForOrder) {
            alert('Lô hàng không hợp lệ!');
            return;
        }

        const quantity = parseInt(defectiveFormData.quantity);
        const processedQuantity = defectiveOrders
            .filter(order => 
                order.materialId === selectedMaterial.id.toString() && 
                order.status === 'APPROVED'
            )
            .reduce((sum, order) => sum + order.quantity, 0);
        
        const availableDefectiveQuantity = selectedBatchForOrder.defectiveQuantity - processedQuantity;

        if (quantity <= 0 || quantity > availableDefectiveQuantity) {
            alert(`Số lượng không hợp lệ!\nHàng lỗi có sẵn: ${availableDefectiveQuantity} ${selectedMaterial.unit}`);
            return;
        }

        const newOrder: DefectiveReturnOrder = {
            id: 'order-' + Date.now(),
            materialId: selectedMaterial.id.toString(),
            materialName: selectedMaterial.name,
            transactionType: 'IMPORT',
            quantity: quantity,
            userId: 'current-user-id',
            userName: 'Current User',
            reason: defectiveFormData.reason,
            status: 'PENDING',
            createdAt: new Date().toLocaleString('vi-VN'),
            updatedAt: new Date().toLocaleString('vi-VN'),
            price: selectedBatchForOrder.purchasePrice,
            supplierId: null,
            supplierName: selectedBatchForOrder.supplier,
            isEdit: true
        };

        setDefectiveOrders(prev => [...prev, newOrder]);
        setDefectiveFormData({
            quantity: '',
            reason: '',
            note: '',
            selectedBatchId: ''
        });
        setShowDefectiveModal(false);
    };

    const updateOrderStatus = (orderId: string, newStatus: DefectiveReturnOrder['status']) => {
        setDefectiveOrders(prev => 
            prev.map(order => 
                order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toLocaleString('vi-VN') } : order
            )
        );
    };

    // Cleanup modal content when modals are closed
    useEffect(() => {
        if (!showDefectiveModal && !showDistributeModal && !showBatchModal && !showEditDefectiveModal) {
            const timer = setTimeout(() => {
                setIsModalContentLoaded(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showDefectiveModal, showDistributeModal, showBatchModal, showEditDefectiveModal]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý phân phối vật tư</h1>
                        <p className="text-base text-gray-600">Theo dõi và quản lý toàn bộ vật tư y tế</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => {
                                fetchMaterials();
                                fetchDistributionHistory();
                                fetchDefectiveOrders();
                            }}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Làm mới</span>
                        </Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="materials" className="flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Danh sách vật tư</span>
                        </TabsTrigger>
                        <TabsTrigger value="defective" className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Đơn đổi trả hàng lỗi</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center space-x-2">
                            <History className="w-4 h-4" />
                            <span>Lịch sử phân phát</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Materials Tab */}
                    <TabsContent value="materials" className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Đang tải danh sách vật tư...</p>
                                </div>
                            </div>
                        ) : (
                            <MaterialsList
                                materials={materials}
                                onOpenBatchModal={openBatchModal}
                                onOpenDistributeModal={openDistributeModal}
                                onOpenDefectiveModal={openDefectiveModal}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                formatNumber={formatNumber}
                                importHistoryByMaterial={importHistoryByMaterial}
                                onFetchImportHistory={fetchImportHistory}
                                onUpdateImportTransaction={updateImportTransaction}
                                onDeleteImportTransaction={deleteImportTransaction}
                            />
                        )}
                    </TabsContent>

                    {/* Defective Orders Tab */}
                    <TabsContent value="defective" className="space-y-4">
                        <DefectiveOrdersList
                            defectiveOrders={defectiveOrders}
                            onUpdateOrderStatus={updateOrderStatus}
                            onOpenEditModal={openEditDefectiveModal}
                            onUpdateDefectiveQuantity={updateDefectiveQuantity}
                            onApproveSupplierReturn={approveSupplierReturn}
                            onRejectSupplierReturn={rejectSupplierReturn}
                            onRefreshData={fetchDefectiveOrders}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <DistributionHistory
                            historyItems={distributionHistory}
                            formatNumber={formatNumber}
                            formatDate={formatDate}
                            onSearch={handleHistorySearch}
                        />
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                {/* Distribution Modal */}
                <DistributionModal
                    isOpen={showDistributeModal}
                    onClose={() => setShowDistributeModal(false)}
                    material={selectedMaterial}
                    onSuccess={handleDistributionSuccess}
                />

                {/* Batch Modal */}
                <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Nhập lô hàng mới: {selectedMaterial?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddBatch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Giá nhập (VND) *</label>
                                <Input
                                    type="text"
                                    placeholder="VD: 1,500,000"
                                    value={batchData.price ? formatNumber(batchData.price) : ''}
                                    onChange={(e) => {
                                        const numericValue = parseNumber(e.target.value);
                                        setBatchData(prev => ({ ...prev, price: numericValue }));
                                    }}
                                    className="h-12 text-base"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Số lượng *</label>
                                    <Input
                                        type="text"
                                        placeholder="VD: 1,000"
                                        value={batchData.quantity ? formatNumber(batchData.quantity) : ''}
                                        onChange={(e) => {
                                            const numericValue = parseNumber(e.target.value);
                                            setBatchData(prev => ({ ...prev, quantity: numericValue }));
                                        }}
                                        className="h-12 text-base"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Số lượng lỗi</label>
                                    <Input
                                        type="text"
                                        placeholder="VD: 100"
                                        value={batchData.defectiveQuantity ? formatNumber(batchData.defectiveQuantity) : ''}
                                        onChange={(e) => {
                                            const numericValue = parseNumber(e.target.value);
                                            const quantity = parseInt(batchData.quantity) || 0;
                                            const defectiveQuantity = parseInt(numericValue) || 0;
                                            
                                            if (defectiveQuantity > quantity && quantity > 0) {
                                                toast({
                                                    title: "Cảnh báo",
                                                    description: "Số lượng lỗi không thể lớn hơn số lượng nhập hàng",
                                                    variant: "destructive",
                                                });
                                                return;
                                            }
                                            
                                            setBatchData(prev => ({ ...prev, defectiveQuantity: numericValue }));
                                        }}
                                        className={`h-12 text-base ${
                                            (parseInt(batchData.defectiveQuantity) || 0) > (parseInt(batchData.quantity) || 0) && batchData.quantity 
                                                ? 'border-red-500 focus:border-red-500' 
                                                : ''
                                        }`}
                                    />
                                    {(parseInt(batchData.defectiveQuantity) || 0) > (parseInt(batchData.quantity) || 0) && batchData.quantity && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Số lượng lỗi không thể lớn hơn số lượng nhập hàng
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Hiển thị số lượng có sẵn */}
                            {batchData.quantity && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                        <strong>Số lượng có sẵn:</strong> {
                                            calculateAvailableQuantityFromBatch(
                                                parseInt(batchData.quantity) || 0,
                                                parseInt(batchData.defectiveQuantity) || 0
                                            ).toLocaleString('vi-VN')
                                        } {selectedMaterial?.unit}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Ngày nhập hàng *</label>
                                    <Input
                                        type="date"
                                        value={batchData.importDate}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, importDate: e.target.value }))}
                                        className="h-12 text-base"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Giờ nhập hàng</label>
                                    <Input
                                        type="time"
                                        value={batchData.importTime}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, importTime: e.target.value }))}
                                        className="h-12 text-base"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Lý do nhập</label>
                                <Textarea
                                    placeholder="Mô tả lý do nhập hàng..."
                                    value={batchData.reason}
                                    onChange={(e) => setBatchData(prev => ({ ...prev, reason: e.target.value }))}
                                    className="text-base min-h-[100px]"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base"
                                disabled={loading}
                            >
                                <DollarSign className="w-5 h-5 mr-2" />
                                {loading ? 'Đang tạo phiếu nhập...' : 'Xác nhận nhập hàng'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Defective Modal */}
                <Dialog open={showDefectiveModal} onOpenChange={setShowDefectiveModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center">
                                <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                                Tạo đơn đổi trả hàng lỗi
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateDefectiveOrder} className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="text-sm text-gray-600">
                                    <strong>Vật tư:</strong> {selectedMaterial?.name}
                                </div>
                                {defectiveFormData.selectedBatchId ? (() => {
                                    const batch = selectedMaterial?.batches.find(b => b.id === defectiveFormData.selectedBatchId);
                                    if (!batch) return null;
                                    
                                    const processedQuantity = defectiveOrders
                                        .filter(order => 
                                            order.materialId === selectedMaterial?.id.toString() && 
                                            order.status === 'APPROVED'
                                        )
                                        .reduce((sum, order) => sum + order.quantity, 0);
                                    const availableDefective = batch.defectiveQuantity - processedQuantity;
                                    
                                    return (
                                        <>
                                            <div className="text-sm text-gray-600">
                                                <strong>Lô hàng:</strong> {batch.batchNumber}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <strong>Nhà cung cấp:</strong> {batch.supplier}
                                            </div>
                                            <div className="text-sm text-red-600">
                                                <strong>Hàng lỗi có sẵn:</strong> {availableDefective} {selectedMaterial?.unit}
                                            </div>
                                        </>
                                    );
                                })() : (
                                    <div className="text-sm text-gray-500 italic">
                                        👆 Vui lòng chọn lô hàng bên dưới để xem thông tin chi tiết
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Chọn lô hàng</label>
                                <Select 
                                    value={defectiveFormData.selectedBatchId} 
                                    onValueChange={(value) => {
                                        const batch = selectedMaterial?.batches.find(b => b.id === value);
                                        setSelectedBatch(batch || null);
                                        setDefectiveFormData(prev => ({ 
                                            ...prev, 
                                            selectedBatchId: value,
                                            quantity: ''
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Chọn lô hàng có lỗi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedMaterial?.batches
                                            .filter(batch => {
                                                const processedQuantity = defectiveOrders
                                                    .filter(order => 
                                                        order.materialId === selectedMaterial?.id.toString() && 
                                                        order.status === 'APPROVED'
                                                    )
                                                    .reduce((sum, order) => sum + order.quantity, 0);
                                                return (batch.defectiveQuantity - processedQuantity) > 0;
                                            })
                                            .map(batch => {
                                                const processedQuantity = defectiveOrders
                                                    .filter(order => 
                                                        order.materialId === selectedMaterial?.id.toString() && 
                                                        order.status === 'APPROVED'
                                                    )
                                                    .reduce((sum, order) => sum + order.quantity, 0);
                                                const availableDefective = batch.defectiveQuantity - processedQuantity;
                                                return (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.batchNumber} - {batch.supplier} (Có {availableDefective} lỗi)
                                                    </SelectItem>
                                                );
                                            })
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Số lượng đổi trả</label>
                                <Input
                                    type="text"
                                    placeholder="VD: 100"
                                    value={defectiveFormData.quantity ? formatNumber(defectiveFormData.quantity) : ''}
                                    onChange={(e) => {
                                        const numericValue = parseNumber(e.target.value);
                                        setDefectiveFormData(prev => ({ ...prev, quantity: numericValue }));
                                    }}
                                    className="h-12 text-base"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Lý do đổi trả</label>
                                <Select 
                                    value={defectiveFormData.reason} 
                                    onValueChange={(value) => setDefectiveFormData(prev => ({ ...prev, reason: value }))}
                                >
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Chọn lý do" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="damaged">Hàng bị hỏng</SelectItem>
                                        <SelectItem value="expired">Hết hạn sử dụng</SelectItem>
                                        <SelectItem value="wrong-spec">Sai thông số kỹ thuật</SelectItem>
                                        <SelectItem value="quality-issue">Lỗi chất lượng</SelectItem>
                                        <SelectItem value="packaging">Bao bì hư hỏng</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Ghi chú thêm</label>
                                <Textarea
                                    placeholder="Mô tả chi tiết về vấn đề..."
                                    value={defectiveFormData.note}
                                    onChange={(e) => setDefectiveFormData(prev => ({ ...prev, note: e.target.value }))}
                                    className="text-base min-h-[100px]"
                                />
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-sm text-yellow-800">
                                    <strong>Giá trị ước tính:</strong> {(() => {
                                        const quantity = parseInt(defectiveFormData.quantity) || 0;
                                        const batch = selectedMaterial?.batches.find(b => b.id === defectiveFormData.selectedBatchId);
                                        const price = batch?.purchasePrice || 0;
                                        return formatCurrency(quantity * price);
                                    })()}
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                disabled={!defectiveFormData.selectedBatchId}
                            >
                                <FileX className="w-5 h-5 mr-2" />
                                {defectiveFormData.selectedBatchId ? 'Tạo đơn đổi trả' : 'Chọn lô hàng để tiếp tục'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default DistributionMaterialManagement; 
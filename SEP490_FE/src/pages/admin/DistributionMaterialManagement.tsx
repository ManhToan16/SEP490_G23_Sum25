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
import DistributionOrdersList from './components/DistributionOrdersList';
import DistributionHistory from './components/DistributionHistory';

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
        batchNumber: '',
        purchasePrice: '',
        quantity: '',
        defectiveQuantity: '',
        purchaseDate: '',
        purchaseTime: '',
        expiryDate: '',
        supplier: ''
    });

    const [distributionData, setDistributionData] = useState<Record<string, number>>({});
    
    const [defectiveFormData, setDefectiveFormData] = useState({
        quantity: '',
        reason: '',
        note: '',
        selectedBatchId: ''
    });

    const [distributionOrders, setDistributionOrders] = useState<DistributionOrder[]>([
        {
            id: 'dist-001',
            materialId: 1,
            materialName: 'Găng tay y tế',
            materialUnit: 'hộp',
            distributions: {
                'Phòng 1': 100,
                'Phòng 2': 50,
                'Phòng 3': 0,
                'Phòng cấp cứu': 75,
                'Phòng xét nghiệm': 25
            },
            totalQuantity: 250,
            status: 'pending',
            createdDate: '16/12/2024',
            createdBy: 'Admin',
            note: 'Phân phát cho 4 phòng'
        },
        {
            id: 'dist-002',
            materialId: 2,
            materialName: 'Khẩu trang y tế',
            materialUnit: 'cái',
            distributions: {
                'Phòng 1': 200,
                'Phòng 2': 150,
                'Phòng 3': 100,
                'Phòng cấp cứu': 300,
                'Phòng xét nghiệm': 50
            },
            totalQuantity: 800,
            status: 'completed',
            createdDate: '14/12/2024',
            createdBy: 'Quản lý',
            note: 'Phân phát khẩu trang cho tất cả phòng'
        }
    ]);

    // State for distribution history from API
    const [distributionHistory, setDistributionHistory] = useState([]);

    const [showEditDefectiveModal, setShowEditDefectiveModal] = useState(false);
    const [showEditDistributionModal, setShowEditDistributionModal] = useState(false);
    const [editingDefectiveOrder, setEditingDefectiveOrder] = useState<DefectiveReturnOrder | null>(null);
    const [editingDistributionOrder, setEditingDistributionOrder] = useState<DistributionOrder | null>(null);
    
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
    const fetchDistributionHistory = useCallback(async () => {
        try {
            const historyData = await adminService.getProvideHistories();
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

    // Modal handlers
    const openDefectiveModal = useCallback((material: Material, batch?: Batch) => {
        // Immediate UI feedback - show modal shell first
        setShowDefectiveModal(true);
        
        // Defer heavy calculations to next frame
        requestAnimationFrame(() => {
            const availableBatches = material.batches.filter(b => {
                const processedQuantity = defectiveOrders
                    .filter(order => order.materialId === material.id.toString() && order.status === 'APPROVED')
                    .reduce((sum, order) => sum + order.defectiveQuantity, 0);
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
        // Immediate modal display
        setShowDistributeModal(true);
        
        // Defer state updates to next frame
        requestAnimationFrame(() => {
            setSelectedMaterial(material);
            setDistributionData({});
            setIsModalContentLoaded(true);
        });
    }, []);

    const openBatchModal = useCallback((material: Material) => {
        // Immediate modal display
        setShowBatchModal(true);
        
        // Defer expensive operations to next frame
        requestAnimationFrame(() => {
            const newBatchNumber = generateBatchNumber();
            const currentDate = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().slice(0, 5);
            
            setSelectedMaterial(material);
            setBatchData({
                batchNumber: newBatchNumber,
                purchasePrice: '',
                quantity: '',
                defectiveQuantity: '',
                purchaseDate: currentDate,
                purchaseTime: currentTime,
                expiryDate: '',
                supplier: ''
            });
            
            setIsModalContentLoaded(true);
        });
    }, [materials]);

    const openEditDefectiveModal = useCallback((order: DefectiveReturnOrder) => {
        const material = materials.find(m => m.id.toString() === order.materialId);
        
        setEditingDefectiveOrder(order);
        setSelectedMaterial(material || null);
        setDefectiveFormData({
            quantity: order.defectiveQuantity.toString(),
            reason: order.reason,
            note: '',
            selectedBatchId: ''
        });
        setShowEditDefectiveModal(true);
    }, [materials]);

    const openEditDistributionModal = useCallback((order: DistributionOrder) => {
        const material = materials.find(m => m.id === order.materialId);
        
        setEditingDistributionOrder(order);
        setDistributionData(order.distributions);
        setSelectedMaterial(material || null);
        setShowEditDistributionModal(true);
    }, [materials]);

    // Action handlers
    const handleAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;

        const newBatch: Batch = {
            id: 'batch' + Date.now(),
            batchNumber: batchData.batchNumber,
            purchasePrice: parseFloat(batchData.purchasePrice),
            quantity: parseInt(batchData.quantity),
            defectiveQuantity: parseInt(batchData.defectiveQuantity) || 0,
            expiryDate: batchData.expiryDate,
            purchaseDate: batchData.purchaseDate,
            purchaseTime: batchData.purchaseTime,
            supplier: batchData.supplier
        };

        const updatedMaterials = materials.map(material => {
            if (material.id === selectedMaterial.id) {
                const newBatches = [...material.batches, newBatch];
                const newTotalQuantity = material.totalQuantity + newBatch.quantity;
                const newAvailableQuantity = material.availableQuantity + newBatch.quantity - newBatch.defectiveQuantity;
                const newTotalValue = newBatches.reduce((sum, batch) => sum + (batch.purchasePrice * batch.quantity), 0);
                const newAveragePrice = newTotalValue / newTotalQuantity;

                return {
                    ...material,
                    totalQuantity: newTotalQuantity,
                    availableQuantity: newAvailableQuantity,
                    batches: newBatches,
                    totalValue: newTotalValue,
                    averagePrice: newAveragePrice
                };
            }
            return material;
        });

        setMaterials(updatedMaterials);
        setShowBatchModal(false);
    };

    const handleDistribute = () => {
        if (!selectedMaterial) return;

        const totalDistributed = Object.values(distributionData).reduce((sum, qty) => sum + qty, 0);
        
        if (totalDistributed <= 0) {
            alert('Vui lòng nhập số lượng phân phát!');
            return;
        }

        if (totalDistributed > selectedMaterial.availableQuantity) {
            alert('Số lượng phân phát vượt quá số lượng có sẵn!');
            return;
        }

        const newDistributionOrder: DistributionOrder = {
            id: 'dist-' + Date.now(),
            materialId: selectedMaterial.id,
            materialName: selectedMaterial.name,
            materialUnit: selectedMaterial.unit,
            distributions: { ...distributionData },
            totalQuantity: totalDistributed,
            status: 'pending',
            createdDate: new Date().toLocaleDateString('vi-VN'),
            createdBy: 'Admin',
            note: `Phân phát cho ${Object.keys(distributionData).filter(room => distributionData[room] > 0).length} phòng`
        };

        setDistributionOrders(prev => [...prev, newDistributionOrder]);
        setDistributionData({});
        setShowDistributeModal(false);
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
            .reduce((sum, order) => sum + order.defectiveQuantity, 0);
        
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
            quantity: selectedBatchForOrder.quantity,
            defectiveQuantity: quantity,
            roomId: null,
            roomType: null,
            userId: 'current-user-id',
            userName: 'Current User',
            reason: defectiveFormData.reason,
            status: 'PENDING',
            createdAt: new Date().toLocaleString('vi-VN'),
            updatedAt: new Date().toLocaleString('vi-VN'),
            price: selectedBatchForOrder.purchasePrice,
            supplierId: null,
            supplierName: selectedBatchForOrder.supplier
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

    const updateDistributionOrderStatus = (orderId: string, newStatus: DistributionOrder['status']) => {
        setDistributionOrders(prev => 
            prev.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const generateBatchNumber = () => {
        const currentYear = new Date().getFullYear();
        const allBatches = materials.flatMap(material => material.batches);
        
        let maxSequence = 0;
        allBatches.forEach(batch => {
            const match = batch.batchNumber.match(/^LOT-(\d{4})-(\d{3})$/);
            if (match && match[1] === currentYear.toString()) {
                const sequence = parseInt(match[2]);
                if (sequence > maxSequence) {
                    maxSequence = sequence;
                }
            }
        });
        
        const nextSequence = (maxSequence + 1).toString().padStart(3, '0');
        return `LOT-${currentYear}-${nextSequence}`;
    };

    // Cleanup modal content when modals are closed
    useEffect(() => {
        if (!showDefectiveModal && !showDistributeModal && !showBatchModal && !showEditDefectiveModal && !showEditDistributionModal) {
            const timer = setTimeout(() => {
                setIsModalContentLoaded(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showDefectiveModal, showDistributeModal, showBatchModal, showEditDefectiveModal, showEditDistributionModal]);

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
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="materials" className="flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Danh sách vật tư</span>
                        </TabsTrigger>
                        <TabsTrigger value="defective" className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Đơn đổi trả hàng lỗi</span>
                        </TabsTrigger>
                        <TabsTrigger value="distribution" className="flex items-center space-x-2">
                            <Truck className="w-4 h-4" />
                            <span>Đơn phân phát vật tư</span>
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
                            />
                        )}
                    </TabsContent>

                    {/* Defective Orders Tab */}
                    <TabsContent value="defective" className="space-y-4">
                        <DefectiveOrdersList
                            defectiveOrders={defectiveOrders}
                            onUpdateOrderStatus={updateOrderStatus}
                            onOpenEditModal={openEditDefectiveModal}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    </TabsContent>

                    {/* Distribution Orders Tab */}
                    <TabsContent value="distribution" className="space-y-4">
                        <DistributionOrdersList
                            distributionOrders={distributionOrders}
                            onUpdateOrderStatus={updateDistributionOrderStatus}
                            onOpenEditModal={openEditDistributionModal}
                            formatNumber={formatNumber}
                            formatDate={formatDate}
                        />
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <DistributionHistory
                            historyItems={distributionHistory}
                            formatNumber={formatNumber}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                {/* Distribution Modal */}
                <Dialog open={showDistributeModal} onOpenChange={setShowDistributeModal}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Phân phát vật tư: {selectedMaterial?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="text-base text-gray-600 bg-blue-50 p-4 rounded-lg">
                                Có sẵn: <span className="font-bold text-blue-900">{selectedMaterial?.availableQuantity} {selectedMaterial?.unit}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mockRooms.map((room) => (
                                    <div key={room} className="space-y-3">
                                        <label className="text-base font-semibold text-gray-900">{room}</label>
                                        <Input
                                            type="text"
                                            placeholder="VD: 1,000"
                                            value={distributionData[room] ? formatNumber(distributionData[room].toString()) : ''}
                                            onChange={(e) => {
                                                const numericValue = parseNumber(e.target.value);
                                                setDistributionData(prev => ({
                                                    ...prev,
                                                    [room]: parseInt(numericValue) || 0
                                                }));
                                            }}
                                            className="h-12 text-base"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-base bg-yellow-50 p-4 rounded-lg">
                                Tổng phân phát: <span className="font-bold text-yellow-900">{Object.values(distributionData).reduce((sum, qty) => sum + qty, 0)} {selectedMaterial?.unit}</span>
                            </div>
                            <Button onClick={handleDistribute} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
                                Xác nhận phân phát
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Batch Modal */}
                <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Nhập lô hàng mới: {selectedMaterial?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddBatch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Số lô</label>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="VD: LOT-2024-001"
                                        value={batchData.batchNumber}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, batchNumber: e.target.value }))}
                                        className="h-12 text-base flex-1"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setBatchData(prev => ({ ...prev, batchNumber: generateBatchNumber() }))}
                                        className="h-12 px-4"
                                        title="Tạo số lô mới"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Giá nhập (VND)</label>
                                <Input
                                    type="text"
                                    placeholder="VD: 1,500,000"
                                    value={batchData.purchasePrice ? formatNumber(batchData.purchasePrice) : ''}
                                    onChange={(e) => {
                                        const numericValue = parseNumber(e.target.value);
                                        setBatchData(prev => ({ ...prev, purchasePrice: numericValue }));
                                    }}
                                    className="h-12 text-base"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Số lượng</label>
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
                                            setBatchData(prev => ({ ...prev, defectiveQuantity: numericValue }));
                                        }}
                                        className="h-12 text-base"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Ngày nhập hàng</label>
                                    <Input
                                        type="date"
                                        value={batchData.purchaseDate}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                                        className="h-12 text-base"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Giờ nhập hàng</label>
                                    <Input
                                        type="time"
                                        value={batchData.purchaseTime}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, purchaseTime: e.target.value }))}
                                        className="h-12 text-base"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-semibold text-gray-900">Hạn sử dụng</label>
                                    <Input
                                        type="date"
                                        value={batchData.expiryDate}
                                        onChange={(e) => setBatchData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        className="h-12 text-base"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900">Nhà cung cấp</label>
                                <Input
                                    placeholder="Tên nhà cung cấp"
                                    value={batchData.supplier}
                                    onChange={(e) => setBatchData(prev => ({ ...prev, supplier: e.target.value }))}
                                    className="h-12 text-base"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Xác nhận nhập hàng
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
                                        .reduce((sum, order) => sum + order.defectiveQuantity, 0);
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
                                                    .reduce((sum, order) => sum + order.defectiveQuantity, 0);
                                                return (batch.defectiveQuantity - processedQuantity) > 0;
                                            })
                                            .map(batch => {
                                                const processedQuantity = defectiveOrders
                                                    .filter(order => 
                                                        order.materialId === selectedMaterial?.id.toString() && 
                                                        order.status === 'APPROVED'
                                                    )
                                                    .reduce((sum, order) => sum + order.defectiveQuantity, 0);
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
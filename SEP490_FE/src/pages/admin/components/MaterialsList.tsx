import React, { useState, useCallback, useMemo, memo, useRef } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Package, AlertTriangle, Truck, ChevronDown, ChevronUp, Search } from 'lucide-react';

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

interface MaterialsListProps {
    materials: Material[];
    onOpenBatchModal: (material: Material) => void;
    onOpenDistributeModal: (material: Material) => void;
    onOpenDefectiveModal: (material: Material) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
    formatNumber: (value: string) => string;
}

// Memoized Search Dropdown Component
const SearchDropdown = memo(({ 
    showSearchDropdown, 
    materials, 
    dropdownSearchResults, 
    materialSearchFilter, 
    onSelectMaterial 
}: {
    showSearchDropdown: boolean;
    materials: Material[];
    dropdownSearchResults: Material[];
    materialSearchFilter: string;
    onSelectMaterial: (material: Material) => void;
}) => {
    if (!showSearchDropdown) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {materials.length === 0 ? (
                <div className="p-3 text-gray-500 text-center text-sm">
                    Chưa có vật tư nào
                </div>
            ) : (
                <div className="py-1">
                    {dropdownSearchResults.map((material) => (
                        <div
                            key={material.id}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => onSelectMaterial(material)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{material.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                                        <span>{material.category}</span>
                                        <span>•</span>
                                        <span>{material.availableQuantity} {material.unit}</span>
                                    </div>
                                </div>
                                {material.availableQuantity <= material.minStockAlert && (
                                    <div className="ml-2">
                                        <Badge variant="destructive" className="text-xs px-1 py-0">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Sắp hết
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {dropdownSearchResults.length === 0 && materialSearchFilter && (
                        <div className="p-3 text-gray-500 text-center text-sm">
                            Không tìm thấy vật tư nào với từ khóa "{materialSearchFilter}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

SearchDropdown.displayName = 'SearchDropdown';

// Memoized Batch Card Component
const BatchCard = memo(({ 
    batch, 
    material, 
    formatCurrency, 
    formatDate 
}: {
    batch: Batch;
    material: Material;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}) => (
    <div className="bg-white p-3 rounded border border-gray-200">
        <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-xs text-gray-900">{batch.batchNumber}</span>
            <Badge variant={batch.defectiveQuantity > 0 ? "destructive" : "default"} className="text-xs">
                {batch.quantity - batch.defectiveQuantity}/{batch.quantity}
            </Badge>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
                <span>Giá nhập:</span>
                <span className="font-medium">{formatCurrency(batch.purchasePrice)}/{material.unit}</span>
            </div>
            <div className="flex justify-between">
                <span>Ngày nhập:</span>
                <span className="font-medium">{formatDate(batch.purchaseDate)}</span>
            </div>
            <div className="flex justify-between">
                <span>Hạn sử dụng:</span>
                <span className="font-medium">{formatDate(batch.expiryDate)}</span>
            </div>
            <div className="flex justify-between">
                <span>Nhà cung cấp:</span>
                <span className="font-medium">{batch.supplier}</span>
            </div>
            {batch.defectiveQuantity > 0 && (
                <div className="flex justify-between text-red-600">
                    <span>Hàng lỗi:</span>
                    <span className="font-medium">{batch.defectiveQuantity} {material.unit}</span>
                </div>
            )}
        </div>
    </div>
));

BatchCard.displayName = 'BatchCard';

// Memoized Room Allocation Component
const RoomAllocation = memo(({ 
    room, 
    allocation, 
    unit 
}: {
    room: string;
    allocation: number;
    unit: string;
}) => (
    <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
        <div className="font-semibold text-blue-900 mb-1 text-xs">{room}</div>
        <div className="text-sm font-bold text-blue-700">{allocation || 0}</div>
        <div className="text-xs text-blue-600">{unit}</div>
    </div>
));

RoomAllocation.displayName = 'RoomAllocation';

// Memoized Material Row Component
const MaterialRow = memo(({ 
    material,
    expandedMaterial,
    batchFilters,
    mockRooms,
    onOpenBatchModal,
    onOpenDistributeModal,
    onOpenDefectiveModal,
    onToggleExpanded,
    onBatchFilterChange,
    formatCurrency,
    formatDate
}: {
    material: Material;
    expandedMaterial: number | null;
    batchFilters: Record<number, string>;
    mockRooms: string[];
    onOpenBatchModal: (material: Material) => void;
    onOpenDistributeModal: (material: Material) => void;
    onOpenDefectiveModal: (material: Material) => void;
    onToggleExpanded: (materialId: number) => void;
    onBatchFilterChange: (materialId: number, filter: string) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}) => {
    const isExpanded = expandedMaterial === material.id;
    const batchFilter = batchFilters[material.id] || '';
    
    // Debouncing refs for button clicks to prevent multiple triggers
    const batchModalTimeoutRef = useRef<NodeJS.Timeout>();
    const distributeModalTimeoutRef = useRef<NodeJS.Timeout>();
    const defectiveModalTimeoutRef = useRef<NodeJS.Timeout>();
    
    const filteredBatches = useMemo(() => 
        material.batches.filter(batch => 
            !batchFilter || 
            batch.batchNumber.toLowerCase().includes(batchFilter.toLowerCase()) ||
            batch.supplier.toLowerCase().includes(batchFilter.toLowerCase())
        ), [material.batches, batchFilter]
    );

    // Optimized button handlers with debouncing and immediate feedback
    const handleBatchModalClick = useCallback(() => {
        if (batchModalTimeoutRef.current) return; // Prevent double clicks
        
        // Immediate visual feedback
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
            button.style.transform = 'scale(0.95)';
            requestAnimationFrame(() => {
                button.style.transform = '';
            });
        }
        
        // Debounced action
        batchModalTimeoutRef.current = setTimeout(() => {
            onOpenBatchModal(material);
            batchModalTimeoutRef.current = undefined;
        }, 50);
    }, [onOpenBatchModal, material]);

    const handleDistributeModalClick = useCallback(() => {
        if (distributeModalTimeoutRef.current) return;
        
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
            button.style.transform = 'scale(0.95)';
            requestAnimationFrame(() => {
                button.style.transform = '';
            });
        }
        
        distributeModalTimeoutRef.current = setTimeout(() => {
            onOpenDistributeModal(material);
            distributeModalTimeoutRef.current = undefined;
        }, 50);
    }, [onOpenDistributeModal, material]);

    const handleDefectiveModalClick = useCallback(() => {
        if (defectiveModalTimeoutRef.current) return;
        
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
            button.style.transform = 'scale(0.95)';
            requestAnimationFrame(() => {
                button.style.transform = '';
            });
        }
        
        defectiveModalTimeoutRef.current = setTimeout(() => {
            onOpenDefectiveModal(material);
            defectiveModalTimeoutRef.current = undefined;
        }, 50);
    }, [onOpenDefectiveModal, material]);

    const handleToggleExpanded = useCallback(() => {
        onToggleExpanded(material.id);
    }, [onToggleExpanded, material.id]);

    const handleBatchFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onBatchFilterChange(material.id, e.target.value);
    }, [onBatchFilterChange, material.id]);

    const clearBatchFilter = useCallback(() => {
        onBatchFilterChange(material.id, '');
    }, [onBatchFilterChange, material.id]);

    return (
        <>
            <tr id={`material-${material.id}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                                {material.name}
                            </div>
                            <div className="text-xs text-gray-500">
                                {material.description}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                        {material.category}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                    {material.totalQuantity} {material.unit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                    {material.availableQuantity} {material.unit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(material.averagePrice)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(material.totalValue)}
                </td>
                <td className="px-4 py-3">
                    {material.availableQuantity <= material.minStockAlert ? (
                        <Badge variant="destructive" className="flex items-center text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sắp hết
                        </Badge>
                    ) : (
                        <Badge variant="default" className="text-xs">
                            Bình thường
                        </Badge>
                    )}
                </td>
                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1">
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={handleBatchModalClick}
                                        className="h-7 px-2 text-xs transition-transform duration-75 hover:scale-105 active:scale-95"
                                        title="Nhập hàng"
                                        style={{ willChange: 'transform' }}
                                    >
                                        <Truck className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                        size="sm"
                                        onClick={handleDistributeModalClick}
                                        className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 transition-transform duration-75 hover:scale-105 active:scale-95"
                                        title="Phân phát"
                                        style={{ willChange: 'transform' }}
                                    >
                                        <Package className="w-3 h-3" />
                                    </Button>
                                                                            <Button 
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleDefectiveModalClick}
                                            className="h-7 px-2 text-xs transition-transform duration-75 hover:scale-105 active:scale-95"
                                            disabled={!material.batches || !material.batches.some(batch => batch.defectiveQuantity > 0)}
                                            title={(!material.batches || !material.batches.some(batch => batch.defectiveQuantity > 0)) ? 
                                                "Không có hàng lỗi để đổi trả" : "Đổi trả"}
                                            style={{ willChange: 'transform' }}
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                        </Button>
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={handleToggleExpanded}
                                        className="h-7 px-2 text-xs transition-transform duration-75 hover:scale-105 active:scale-95"
                                        title="Xem chi tiết"
                                        style={{ willChange: 'transform' }}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-3 h-3" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                </td>
            </tr>
            
            {isExpanded && (
                <tr>
                    <td colSpan={8} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900">Thông tin lô hàng</h4>
                                    <div className="flex items-center space-x-2">
                                        <Search className="w-3 h-3 text-gray-500" />
                                        <Input
                                            type="text"
                                            placeholder="Tìm theo số lô..."
                                            value={batchFilter}
                                            onChange={handleBatchFilterChange}
                                            className="w-32 h-7 text-xs"
                                        />
                                        {batchFilter && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={clearBatchFilter}
                                                className="px-1 h-7 text-xs"
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {filteredBatches.length > 0 ? (
                                        filteredBatches.map((batch) => (
                                            <BatchCard
                                                key={batch.id}
                                                batch={batch}
                                                material={material}
                                                formatCurrency={formatCurrency}
                                                formatDate={formatDate}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-4 text-gray-500">
                                            {batchFilter ? 
                                                `Không tìm thấy lô hàng nào với từ khóa "${batchFilter}"` :
                                                'Chưa có thông tin lô hàng'
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-gray-900">Phân bổ theo phòng</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {mockRooms.map((room) => (
                                        <RoomAllocation
                                            key={room}
                                            room={room}
                                            allocation={material.roomAllocations[room]}
                                            unit={material.unit}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
});

MaterialRow.displayName = 'MaterialRow';

const MaterialsList: React.FC<MaterialsListProps> = ({
    materials,
    onOpenBatchModal,
    onOpenDistributeModal,
    onOpenDefectiveModal,
    formatCurrency,
    formatDate,
    formatNumber
}) => {
    const [materialSearchFilter, setMaterialSearchFilter] = useState('');
    const [debouncedSearchFilter, setDebouncedSearchFilter] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [expandedMaterial, setExpandedMaterial] = useState<number | null>(null);
    const [batchFilters, setBatchFilters] = useState<Record<number, string>>({});

    const mockRooms = useMemo(() => 
        ['Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng cấp cứu', 'Phòng xét nghiệm'], 
        []
    );

    // Debounced search effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchFilter(materialSearchFilter);
        }, 300);

        return () => clearTimeout(timer);
    }, [materialSearchFilter]);

    const filteredMaterials = useMemo(() => 
        materials.filter(material => {
            if (!debouncedSearchFilter) return true;
            
            const searchTerm = debouncedSearchFilter.toLowerCase();
            return (
                material.name.toLowerCase().includes(searchTerm) ||
                material.category.toLowerCase().includes(searchTerm) ||
                material.description.toLowerCase().includes(searchTerm) ||
                material.batches.some(batch => 
                    batch.batchNumber.toLowerCase().includes(searchTerm) ||
                    batch.supplier.toLowerCase().includes(searchTerm)
                )
            );
        }), [materials, debouncedSearchFilter]
    );

    const dropdownSearchResults = useMemo(() => 
        materials
            .filter(material => {
                if (!materialSearchFilter) return true;
                const searchTerm = materialSearchFilter.toLowerCase();
                return (
                    material.name.toLowerCase().includes(searchTerm) ||
                    material.category.toLowerCase().includes(searchTerm) ||
                    material.description.toLowerCase().includes(searchTerm)
                );
            })
            .slice(0, 8), [materials, materialSearchFilter]
    );

    const handleSelectMaterial = useCallback((material: Material) => {
        setMaterialSearchFilter(material.name);
        setShowSearchDropdown(false);
        
        requestAnimationFrame(() => {
            const element = document.getElementById(`material-${material.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-blue-500');
                }, 2000);
            }
        });
    }, []);

    const handleToggleExpanded = useCallback((materialId: number) => {
        setExpandedMaterial(prev => prev === materialId ? null : materialId);
    }, []);

    const handleBatchFilterChange = useCallback((materialId: number, filter: string) => {
        setBatchFilters(prev => ({
            ...prev,
            [materialId]: filter
        }));
    }, []);

    const clearMaterialSearch = useCallback(() => {
        setMaterialSearchFilter('');
        setShowSearchDropdown(false);
    }, []);

    const handleSearchFocus = useCallback(() => {
        setShowSearchDropdown(true);
    }, []);

    const handleSearchBlur = useCallback(() => {
        setTimeout(() => setShowSearchDropdown(false), 200);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Danh sách vật tư</h2>
                <div className="flex items-center space-x-4">
                    <div className="relative flex items-center space-x-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm vật tư, danh mục, lô hàng..."
                                value={materialSearchFilter}
                                onChange={(e) => setMaterialSearchFilter(e.target.value)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                className="w-64"
                            />
                            
                            <SearchDropdown
                                showSearchDropdown={showSearchDropdown}
                                materials={materials}
                                dropdownSearchResults={dropdownSearchResults}
                                materialSearchFilter={materialSearchFilter}
                                onSelectMaterial={handleSelectMaterial}
                            />
                        </div>
                        {materialSearchFilter && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearMaterialSearch}
                                className="px-2 h-8"
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            
            {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {materialSearchFilter ? 
                        `Không tìm thấy vật tư nào với từ khóa "${materialSearchFilter}"` :
                        'Chưa có vật tư nào'
                    }
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vật tư
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Danh mục
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng số lượng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Có sẵn
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giá trung bình
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng giá trị
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMaterials.map((material) => (
                                    <MaterialRow
                                        key={material.id}
                                        material={material}
                                        expandedMaterial={expandedMaterial}
                                        batchFilters={batchFilters}
                                        mockRooms={mockRooms}
                                        onOpenBatchModal={onOpenBatchModal}
                                        onOpenDistributeModal={onOpenDistributeModal}
                                        onOpenDefectiveModal={onOpenDefectiveModal}
                                        onToggleExpanded={handleToggleExpanded}
                                        onBatchFilterChange={handleBatchFilterChange}
                                        formatCurrency={formatCurrency}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default memo(MaterialsList);
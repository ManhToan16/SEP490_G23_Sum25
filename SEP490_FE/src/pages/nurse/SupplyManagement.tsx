import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Package, Plus, AlertTriangle, CheckCircle, Truck, History, FileText, Calendar, User } from 'lucide-react';
import ReceiptTab from './components/ReceiptTab';
import HistoryTab from './components/HistoryTab';
import UsageTab from './components/UsageTab';

// Interface cho vật tư
interface Supply {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
  status: 'normal' | 'low' | 'out';
  location: string;
  supplier?: string;
}

// Interface cho đơn hàng nhận
interface ReceiptOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: 'pending' | 'received' | 'cancelled';
  totalItems: number;
  totalAmount: number;
  notes?: string;
}





const SupplyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'receipt' | 'usage' | 'history'>('receipt');

  // Mock data cho đơn hàng nhận (fallback)
  const [receiptOrders] = useState<ReceiptOrder[]>([
    {
      id: '1',
      orderNumber: 'PO-2024-001',
      supplierName: 'Công ty TNHH Dược phẩm ABC',
      orderDate: '2024-01-15',
      expectedDate: '2024-01-20',
      status: 'pending',
      totalItems: 15,
      totalAmount: 2500000,
      notes: 'Đơn hàng vật tư tháng 1'
    },
    {
      id: '2',
      orderNumber: 'PO-2024-002',
      supplierName: 'Công ty Thiết bị Y tế XYZ',
      orderDate: '2024-01-18',
      expectedDate: '2024-01-25',
      status: 'received',
      totalItems: 8,
      totalAmount: 1800000,
      notes: 'Thiết bị y tế mới'
    },
    {
      id: '3',
      orderNumber: 'PO-2024-003',
      supplierName: 'Công ty Vật tư Y tế DEF',
      orderDate: '2024-01-20',
      expectedDate: '2024-01-22',
      status: 'pending',
      totalItems: 12,
      totalAmount: 3200000,
      notes: 'Bổ sung vật tư khẩn cấp'
    }
  ]);









  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý vật tư</h1>
          <p className="text-gray-600">Quản lý nhận hàng, sử dụng và lịch sử vật tư phòng khám</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('receipt')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'receipt'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="inline-block w-4 h-4 mr-2" />
              Nhận hàng
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="inline-block w-4 h-4 mr-2" />
              Sử dụng
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="inline-block w-4 h-4 mr-2" />
              Lịch sử
            </button>
          </nav>
        </div>

            {/* Tab Content */}
      {activeTab === 'receipt' && <ReceiptTab />}

                           {activeTab === 'usage' && <UsageTab />}

             {activeTab === 'history' && <HistoryTab />}
       </div>
     </div>
   );
 };

export default SupplyManagement; 
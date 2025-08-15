import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Package, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

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
}

const SupplyManagement: React.FC = () => {
  const [supplies] = useState<Supply[]>([
    {
      id: '1',
      name: 'Bông gòn y tế',
      category: 'Vật tư tiêu hao',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unit: 'gói',
      lastUpdated: '2024-01-15',
      status: 'normal',
      location: 'Kệ A - Tầng 1'
    },
    {
      id: '2',
      name: 'Găng tay latex',
      category: 'Vật tư tiêu hao',
      currentStock: 25,
      minStock: 30,
      maxStock: 100,
      unit: 'hộp',
      lastUpdated: '2024-01-14',
      status: 'low',
      location: 'Kệ B - Tầng 1'
    },
    {
      id: '3',
      name: 'Kim tiêm 5ml',
      category: 'Vật tư tiêu hao',
      currentStock: 0,
      minStock: 20,
      maxStock: 50,
      unit: 'cái',
      lastUpdated: '2024-01-13',
      status: 'out',
      location: 'Kệ C - Tầng 1'
    },
    {
      id: '4',
      name: 'Máy đo huyết áp',
      category: 'Thiết bị y tế',
      currentStock: 3,
      minStock: 2,
      maxStock: 5,
      unit: 'cái',
      lastUpdated: '2024-01-15',
      status: 'normal',
      location: 'Phòng khám 1'
    },
    {
      id: '5',
      name: 'Thuốc giảm đau',
      category: 'Thuốc',
      currentStock: 45,
      minStock: 20,
      maxStock: 80,
      unit: 'viên',
      lastUpdated: '2024-01-15',
      status: 'normal',
      location: 'Tủ thuốc chính'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đủ</Badge>;
      case 'low':
        return <Badge variant="destructive">Thiếu</Badge>;
      case 'out':
        return <Badge variant="destructive">Hết</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= min) return 'low';
    if (percentage >= 80) return 'high';
    return 'normal';
  };

  const normalSupplies = supplies.filter(s => s.status === 'normal');
  const lowSupplies = supplies.filter(s => s.status === 'low');
  const outSupplies = supplies.filter(s => s.status === 'out');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý vật tư trong phòng</h1>
        <p className="text-gray-600 mt-2">Theo dõi và quản lý vật tư, thiết bị y tế trong phòng khám</p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng vật tư</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplies.length}</div>
            <p className="text-xs text-muted-foreground">Loại vật tư</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đủ hàng</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{normalSupplies.length}</div>
            <p className="text-xs text-muted-foreground">Loại vật tư</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thiếu hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowSupplies.length}</div>
            <p className="text-xs text-muted-foreground">Loại vật tư</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outSupplies.length}</div>
            <p className="text-xs text-muted-foreground">Loại vật tư</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách vật tư */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách vật tư</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm vật tư
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm vật tư mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên vật tư</Label>
                  <Input id="name" placeholder="Nhập tên vật tư" />
                </div>
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input id="category" placeholder="Nhập danh mục" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Số lượng hiện tại</Label>
                    <Input id="currentStock" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="unit">Đơn vị</Label>
                    <Input id="unit" placeholder="cái, gói, viên..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStock">Số lượng tối thiểu</Label>
                    <Input id="minStock" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Số lượng tối đa</Label>
                    <Input id="maxStock" type="number" placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Vị trí lưu trữ</Label>
                  <Input id="location" placeholder="Nhập vị trí lưu trữ" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.map((supply) => (
                <TableRow key={supply.id}>
                  <TableCell>
                    <div className="font-medium">{supply.name}</div>
                    <div className="text-sm text-gray-500">ID: {supply.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supply.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Hiện tại:</span> {supply.currentStock} {supply.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {supply.minStock} | Max: {supply.maxStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(supply.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{supply.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{supply.lastUpdated}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">
                        Cập nhật
                      </Button>
                      <Button size="sm" variant="outline">
                        Chi tiết
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cảnh báo vật tư thiếu */}
      {(lowSupplies.length > 0 || outSupplies.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Cảnh báo vật tư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outSupplies.map((supply) => (
                <div key={supply.id} className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div>
                    <div className="font-medium text-red-800">{supply.name}</div>
                    <div className="text-sm text-red-600">Hết hàng - Cần bổ sung ngay</div>
                  </div>
                  <Button size="sm" variant="destructive">
                    Đặt hàng
                  </Button>
                </div>
              ))}
              {lowSupplies.map((supply) => (
                <div key={supply.id} className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                  <div>
                    <div className="font-medium text-yellow-800">{supply.name}</div>
                    <div className="text-sm text-yellow-600">Thiếu hàng - Cần bổ sung sớm</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Đặt hàng
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplyManagement; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { User, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const TechnicianDashboard: React.FC = () => {
  const technicianInfo = {
    name: 'Nguyễn Văn Kỹ Thuật',
    email: 'kythuat@clinic.com',
    phone: '0123456789',
    department: 'Phòng Xét nghiệm',
    position: 'Kỹ thuật viên',
    employeeId: 'TECH001',
    joinDate: '01/01/2023'
  };

  const stats = {
    totalTests: 156,
    completedTests: 142,
    pendingTests: 14,
    todayTests: 8
  };

  const recentTests = [
    {
      id: '1',
      patientName: 'Trần Thị A',
      testType: 'Xét nghiệm máu',
      status: 'completed',
      time: '09:30'
    },
    {
      id: '2',
      patientName: 'Lê Văn B',
      testType: 'Xét nghiệm nước tiểu',
      status: 'pending',
      time: '10:15'
    },
    {
      id: '3',
      patientName: 'Phạm Thị C',
      testType: 'Xét nghiệm sinh hóa',
      status: 'completed',
      time: '11:00'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="secondary">Đang chờ</Badge>;
      case 'in-progress':
        return <Badge variant="outline">Đang xử lý</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Kỹ thuật viên</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và lịch xét nghiệm</p>
      </div>

      {/* Thông tin cá nhân */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Thông tin của tôi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {technicianInfo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                  <p className="text-lg font-semibold">{technicianInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã nhân viên</label>
                  <p className="text-lg font-semibold">{technicianInfo.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base">{technicianInfo.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-base">{technicianInfo.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng ban</label>
                  <p className="text-base">{technicianInfo.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chức vụ</label>
                  <p className="text-base">{technicianInfo.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày vào làm</label>
                  <p className="text-base">{technicianInfo.joinDate}</p>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="outline">
                  Cập nhật thông tin
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê xét nghiệm */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng xét nghiệm</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Tất cả thời gian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTests}</div>
            <p className="text-xs text-muted-foreground">Xét nghiệm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTests}</div>
            <p className="text-xs text-muted-foreground">Xét nghiệm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayTests}</div>
            <p className="text-xs text-muted-foreground">Xét nghiệm</p>
          </CardContent>
        </Card>
      </div>

      {/* Xét nghiệm gần đây */}
      <Card>
        <CardHeader>
          <CardTitle>Xét nghiệm gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="font-medium">{test.patientName}</div>
                    <div className="text-sm text-gray-500">{test.testType}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">{test.time}</div>
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Xem tất cả xét nghiệm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianDashboard; 
import React from 'react';
import { Button, Card, CardContent, Chip, Divider, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  Phone,
  MapPin,
  Clock,
  Star,
  Heart,
  Brain,
  Shield,
  Users,
  Award,
  CheckCircle,
  Calendar,
  Stethoscope,
  UserCheck,
  HeadphonesIcon,
  Activity
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 via-blue-100 to-emerald-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Box className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 inline-block rounded-full px-3 py-1">
            Phòng khám chuyên khoa Nội Thần Kinh
          </Box>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Hành trình hồi phục từ bên trong
            <span className="block text-blue-600">bắt đầu tại đây</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Phòng khám Nội Thần Kinh Khánh An với đội ngũ giàu kinh nghiệm –
            không chỉ điều trị, mà còn đồng hành cùng bạn trên con đường phục hồi sức khỏe.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="large"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => navigate("/patient/book-appointment")}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Đặt lịch hẹn ngay
            </Button>
            <Button
              size="large"
              variant="outlined"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              <Phone className="mr-2 h-5 w-5" />
              Tư vấn miễn phí
            </Button>
            <Button
              size="large"
              variant="contained"
              className="text-slate-600 hover:underline"
              onClick={() => navigate("/auth/login")}
            >
              Đăng nhập
            </Button>
            <Button
              size="large"
              variant="outlined"
              className="text-slate-600 hover:underline"
              onClick={() => navigate("/auth/register")}
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Vì sao chọn chúng tôi?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tại Phòng khám Nội Thần Kinh Khánh An, chúng tôi không chỉ điều trị triệu chứng –
              mà còn quan tâm đến chất lượng sống lâu dài của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Chuyên khoa đầu ngành</h3>
              <p className="text-slate-600 text-sm">Đội ngũ bác sĩ chuyên sâu về thần kinh với kinh nghiệm lâu năm</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Chăm sóc tận tâm</h3>
              <p className="text-slate-600 text-sm">Lắng nghe và hiểu từng nhu cầu riêng biệt của bệnh nhân</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-slate-500">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Trang thiết bị hiện đại</h3>
              <p className="text-slate-600 text-sm">Máy móc và phương pháp điều trị tiên tiến nhất</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Hỗ trợ dài hạn</h3>
              <p className="text-slate-600 text-sm">Theo dõi và đồng hành cùng bệnh nhân sau điều trị</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Dịch vụ chuyên khoa
            </h2>
            <p className="text-lg text-slate-600">
              Chăm sóc toàn diện từ chẩn đoán đến điều trị và phục hồi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Điều trị đau đầu mãn tính</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Chẩn đoán nguyên nhân và điều trị hiệu quả các loại đau đầu, đau nửa đầu.
                  Phương pháp điều trị cá nhân hóa cho từng bệnh nhân.
                </p>
                <Chip variant="outlined" className="text-xs" label='Điều trị chuyên sâu'></Chip>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <HeadphonesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Điều trị mất ngủ, lo âu</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Hỗ trợ điều trị rối loạn giấc ngủ, lo âu, trầm cảm nhẹ.
                  Kết hợp liệu pháp tâm lý và điều trị y khoa.
                </p>
                <Chip variant="outlined" className="text-xs" label='Tâm lý - Y khoa'></Chip>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Tư vấn sa sút trí tuệ</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Chẩn đoán sớm và can thiệp kịp thời các rối loạn nhận thức,
                  Alzheimer. Hỗ trợ gia đình chăm sóc bệnh nhân.
                </p>
                <Chip variant="outlined" className="text-xs" label='Chẩn đoán sớm'></Chip>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Điều trị thoái hóa thần kinh</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Chăm sóc bệnh nhân thoái hóa thần kinh và di chứng sau tai biến.
                  Phục hồi chức năng và cải thiện chất lượng sống.
                </p>
                <Chip variant="outlined" className="text-xs" label='Phục hồi chức năng'></Chip>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Khám tiền đình, chóng mặt</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Điều trị các rối loạn tiền đình, chóng mặt, mất thăng bằng.
                  Phương pháp điều trị hiện đại và hiệu quả.
                </p>
                <Chip variant="outlined" className="text-xs" label='Điều trị chóng mặt'></Chip>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Theo dõi Parkinson, động kinh</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Quản lý và theo dõi lâu dài các bệnh lý thần kinh mãn tính.
                  Điều chỉnh thuốc và hỗ trợ gia đình bệnh nhân.
                </p>
                <Chip variant="outlined" className="text-xs" label='Theo dõi lâu dài'></Chip>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Doctor Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Đội ngũ chuyên gia
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Đội ngũ y bác sĩ tại Khánh An không chỉ giỏi chuyên môn –
              mà còn có trái tim rộng mở để hiểu người bệnh từ bên trong.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-b from-blue-100 to-blue-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Kinh nghiệm lâu năm</h3>
              <p className="text-slate-600 text-sm">
                Hơn 15 năm kinh nghiệm trong lĩnh vực thần kinh học,
                từng công tác tại các bệnh viện lớn.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-b from-emerald-100 to-emerald-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-16 w-16 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Tận tâm lắng nghe</h3>
              <p className="text-slate-600 text-sm">
                Luôn dành thời gian lắng nghe, thấu hiểu từng lo lắng và
                nhu cầu riêng biệt của bệnh nhân.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-b from-purple-100 to-purple-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Đồng hành cùng bệnh nhân</h3>
              <p className="text-slate-600 text-sm">
                Không vội vã, không áp lực. Mỗi bệnh nhân đều được tư vấn
                cá nhân hóa và theo dõi sát sao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Không gian chăm sóc
            </h2>
            <p className="text-lg text-slate-600">
              Môi trường thân thiện, riêng tư và hiện đại để bạn cảm thấy thoải mái nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Thiết kế theo tiêu chuẩn quốc tế
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800">Phòng tiếp đón ấm cúng</h4>
                    <p className="text-slate-600 text-sm">Không gian thoáng đãng với ánh sáng tự nhiên, tạo cảm giác thư giãn</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800">Phòng khám riêng tư</h4>
                    <p className="text-slate-600 text-sm">Đảm bảo sự riêng tư tuyệt đối cho mỗi cuộc thăm khám</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800">Phòng tư vấn tâm lý</h4>
                    <p className="text-slate-600 text-sm">Không gian yên tĩnh cho các buổi tư vấn và trị liệu</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800">Khu vực theo dõi</h4>
                    <p className="text-slate-600 text-sm">Trang bị máy móc hiện đại để theo dõi sức khỏe bệnh nhân</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-50 p-8 rounded-xl">
              <div className="text-center">
                <div className="bg-white w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Activity className="h-12 w-12 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-800 mb-3">
                  Tông màu thương hiệu
                </h4>
                <p className="text-slate-600 text-sm mb-4">
                  Sử dụng các tông xanh nhạt, trắng và ánh sáng tự nhiên
                  để tạo cảm giác bình yên và thư giãn
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-300"></div>
                  <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                  <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                  <div className="w-4 h-4 rounded-full bg-emerald-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Cảm nhận từ bệnh nhân
            </h2>
            <p className="text-lg text-slate-600">
              Những chia sẻ chân thành từ những người đã tin tưởng đồng hành cùng chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-l-blue-500">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4 italic">
                  "Sau nhiều năm mất ngủ vì stress công việc, tôi cuối cùng đã tìm được nơi thực sự hiểu mình.
                  Bác sĩ không chỉ đưa ra phương pháp điều trị mà còn lắng nghe tâm sự của tôi."
                </p>
                <div className="text-sm text-slate-500">
                  <strong className="text-slate-700">Chị Ngọc A.</strong>, 35 tuổi
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-l-4 border-l-emerald-500">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4 italic">
                  "Bác sĩ không chỉ chữa bệnh mà còn giúp tôi tìm lại sự tự tin.
                  Phòng khám có không gian rất ấm cúng, tôi cảm thấy như đang được gia đình chăm sóc."
                </p>
                <div className="text-sm text-slate-500">
                  <strong className="text-slate-700">Anh Long T.</strong>, 52 tuổi
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4 italic">
                  "Mẹ tôi được chẩn đoán Alzheimer sớm nhờ đội ngũ ở đây.
                  Họ không chỉ hỗ trợy mẹ mà còn hướng dẫn gia đình chúng tôi cách chăm sóc tốt nhất."
                </p>
                <div className="text-sm text-slate-500">
                  <strong className="text-slate-700">Chị Minh H.</strong>, 28 tuổi
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Đặt lịch hẹn dễ dàng
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hãy để chúng tôi giúp bạn hồi phục – từng ngày, từng bước
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-lg">
              <Phone className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Gọi điện trực tiếp</h3>
              <p className="text-white/80 text-sm mb-3">Tư vấn ngay lập tức với đội ngũ chăm sóc khách hàng</p>
              <p className="font-semibold">028 3838 9999</p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Đặt lịch online</h3>
              <p className="text-white/80 text-sm mb-3">Chọn thời gian phù hợp với lịch trình của bạn</p>
              <p className="font-semibold">24/7 mở cửa</p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Đến trực tiếp</h3>
              <p className="text-white/80 text-sm mb-3">Tại trung tâm TP.HCM, giao thông thuận lợi</p>
              <p className="font-semibold">Quận 1, TP.HCM</p>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-lg mb-8">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Thứ 2-7: 8:00-17:00</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Đường ABC, Q.1, TP.HCM</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>028 3838 9999</span>
              </div>
            </div>
          </div>

          <Button size="large" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
            <Calendar className="mr-2 h-5 w-5" />
            Đặt lịch hẹn ngay
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-lg text-slate-600">
              Những thông tin hữu ích dành cho bệnh nhân
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Có cần mang theo hồ sơ bệnh án cũ không?
                </h3>
                <p className="text-slate-600 text-sm">
                  Bạn nên mang theo các kết quả xét nghiệm, chẩn đoán hình ảnh và đơn thuốc gần nhất
                  để bác sĩ có cái nhìn tổng quan về tình trạng sức khỏe.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Khám có cần nhịn ăn hay chuẩn bị gì đặc biệt?
                </h3>
                <p className="text-slate-600 text-sm">
                  Thông thường không cần nhịn ăn. Tuy nhiên, một số xét nghiệm có thể yêu cầu nhịn ăn,
                  đội ngũ sẽ thông báo trước khi đặt lịch.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Chi phí khám chữa bệnh như thế nào?
                </h3>
                <p className="text-slate-600 text-sm">
                  Phí khám tư vấn từ 300.000-500.000đ tùy theo mức độ phức tạp.
                  Chúng tôi có chính sách hỗ trợ cho bệnh nhân có hoàn cảnh khó khăn.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Có hỗ trợ bệnh nhân lớn tuổi không?
                </h3>
                <p className="text-slate-600 text-sm">
                  Phòng khám có thang máy, ghế nghỉ thoải mái và đội ngũ hỗ trợ chuyên biệt
                  cho người cao tuổi. Gia đình có thể đi cùng trong quá trình khám.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="bg-gradient-to-r from-blue-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Cam kết đồng hành cùng bạn
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Dù bạn đang bước vào hành trình điều trị đầu tiên hay đã đi một chặng đường dài –
              chúng tôi ở đây để đồng hành cùng bạn, mỗi ngày một khỏe mạnh hơn.
            </p>
            <p className="text-slate-500 mb-8 italic">
              "Sức khỏe của bạn là ưu tiên hàng đầu của chúng tôi"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="large" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Calendar className="mr-2 h-5 w-5" />
                Bắt đầu hành trình hồi phục
              </Button>
              <Button size="large" variant="outlined" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3">
                <Phone className="mr-2 h-5 w-5" />
                Tư vấn với chuyên gia
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 text-blue-300">
                Phòng khám Nội Thần Kinh Khánh An
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Đồng hành cùng sức khỏe thần kinh của bạn với sự tận tâm và chuyên nghiệp cao nhất.
              </p>
              <div className="flex space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-300"></div>
                <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                <div className="w-4 h-4 rounded-full bg-emerald-200"></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-2 text-slate-300 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>028 3838 9999</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>T2-T7: 8:00-17:00</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>Điều trị đau đầu mãn tính</li>
                <li>Điều trị mất ngủ, lo âu</li>
                <li>Tư vấn sa sút trí tuệ</li>
                <li>Khám tiền đình, chóng mặt</li>
                <li>Theo dõi Parkinson</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Giá trị cốt lõi</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Đồng cảm</li>
                <li>• Chuyên nghiệp</li>
                <li>• Tận tâm</li>
                <li>• Tích cực</li>
              </ul>
            </div>
          </div>

          <Divider className="my-8 bg-slate-600" />

          <div className="text-center text-slate-400 text-sm">
            <p>&copy; 2024 Phòng khám Nội Thần Kinh Khánh An. Được thiết kế với ❤️ cho sức khỏe cộng đồng.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { FileText, Clock, Star } from 'lucide-react';
import { patientService } from '@/shared/services/patientService';

function removeVietnameseTones(str) {
  return str
    .normalize("NFD") // tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const MedicalServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const trimmed = searchTerm.trim();
        if (trimmed.length > 0) {
          const res = await patientService.getAllServices(1, 1000);
          const filtered = res.items.filter(item =>
            removeVietnameseTones(item.name).includes(removeVietnameseTones(trimmed))
          );
          setServices(filtered);
          setTotalItems(filtered.length);
        } else {
          const res = await patientService.getAllServices(page, pageSize);
          setServices(res.items);
          setTotalItems(res.totalItems);
        }
      } catch (err) {
        console.error("Lỗi fetch dịch vụ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Dịch Vụ Y Tế</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
          Cung cấp đầy đủ các dịch vụ khám, điều trị và xét nghiệm chuyên khoa thần kinh với 7 phòng cận lâm sàng hiện đại
        </p>
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // reset page khi tìm
          }}
          className="px-4 py-2 border rounded-md w-full max-w-md mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Đang tải danh sách dịch vụ...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration || 'Không rõ thời lượng'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-lg font-bold px-3 py-1">
                    {service.price ? `${service.price.toLocaleString()} VNĐ` : 'Liên hệ'}
                  </Badge>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {Array.isArray(service.features) && service.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bao Gồm:
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-blue-50 border-blue-200 mt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-3">Gói Khám Sức Khỏe Tổng Quát</h3>
              <p className="text-blue-700 mb-4">
                Tiết kiệm chi phí khi đăng ký gói khám tổng hợp nhiều dịch vụ cận lâm sàng
              </p>
              <div className="flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15%</div>
                  <div className="text-blue-700">Giảm giá gói cơ bản</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">25%</div>
                  <div className="text-blue-700">Giảm giá gói nâng cao</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">30%</div>
                  <div className="text-blue-700">Giảm giá gói VIP</div>
                </div>
              </div>
            </div>
          </Card>

          {!isSearching && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ← Trước
              </button>
              <span className="text-gray-600">Trang {page} / {Math.ceil(totalItems / pageSize)}</span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= Math.ceil(totalItems / pageSize)}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicalServices;

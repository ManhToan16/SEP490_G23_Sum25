
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Search, FileText, Calendar, User } from 'lucide-react';
import { useToast } from '@/shared/components/ui/use-toast';

const ResultLookup = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const { toast } = useToast();

  const handleSearch = (e) => {
    e.preventDefault();

    // Simulate search result
    if (searchCode.toLowerCase() === 'kh001') {
      setSearchResult({
        patientName: 'Nguyễn Văn A',
        recordCode: 'KH001',
        examDate: '2024-01-15',
        doctor: 'BS. Nguyễn Văn An',
        diagnosis: 'Đau đầu mạn tính',
        examResults: [
          {
            type: 'Khám lâm sàng',
            date: '2024-01-15',
            result: 'Bệnh nhân có triệu chứng đau đầu nhẹ, không có dấu hiệu thần kinh nặng'
          },
          {
            type: "Điện não đồ",
            date: "2024-01-15",
            result: "Không có dấu hiệu bất thường",
            attachments: [
              {
                type: "image/jpeg",
                url: "https://cdn.com/eeg001.jpg",
                description: "Sóng điện não vùng trán"
              }
            ]
          },
          {
            type: "Điện cơ",
            date: "2024-01-15",
            result: "Có bất thường nhẹ",
            attachments: [
              {
                type: "application/pdf",
                url: "https://cdn.com/emg001.pdf",
                description: "Báo cáo kết quả điện cơ"
              }
            ]
          }
        ],
        labResults: [
          {
            type: 'Xét nghiệm máu',
            date: '2024-01-15',
            result: 'Các chỉ số trong giới hạn bình thường'
          }
        ],
        conclusion: {
          summary: "Bệnh nhân được chẩn đoán đau đầu mạn tính không rõ nguyên nhân. Không có dấu hiệu tổn thương thần kinh trung ương. Đã kê đơn giảm đau và theo dõi.",
          recommendation: "Tái khám sau 7 ngày. Tránh thức khuya và sử dụng điện thoại quá lâu. Nếu có đau tăng, quay lại sớm."
        },
        prescription: [
          {
            medicineName: "Paracetamol 500mg",
            activeIngredient: "Paracetamol",
            form: "Viên nén",
            strength: "500mg",
            route: "Uống",
            dosage: "1 viên/lần",
            frequency: "3 lần/ngày",
            duration: "7 ngày",
            quantity: 21,
            usageNote: "Sau khi ăn",
          }
        ]
      });
    } else {
      toast({
        title: "Không tìm thấy kết quả",
        description: "Vui lòng kiểm tra lại mã hồ sơ",
        // variant: "destructive"
      });
      setSearchResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tra Cứu Kết Quả</h2>
        <p className="text-lg text-gray-600">
          Nhập mã hồ sơ để xem kết quả khám bệnh
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="max-w-md mx-auto">
            <Label htmlFor="recordCode" className="text-lg font-semibold">
              Mã Hồ Sơ *
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="recordCode"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã hồ sơ (VD: KH001)"
                className="text-lg"
                required
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Hướng Dẫn:</h3>
          <ul className="space-y-1 text-blue-700 text-sm">
            <li>• Mã hồ sơ được gửi qua email sau khi hoàn thành khám</li>
            <li>• Thử với mã "KH001" để xem demo kết quả</li>
            <li>• Liên hệ hotline 0912345678 nếu không nhận được mã</li>
          </ul>
        </div>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Thông Tin Bệnh Nhân</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Họ tên:</span> {searchResult.patientName}
              </div>
              <div>
                <span className="font-semibold">Mã hồ sơ:</span> {searchResult.recordCode}
              </div>
              <div>
                <span className="font-semibold">Ngày khám:</span> {searchResult.examDate}
              </div>
              <div>
                <span className="font-semibold">Bác sĩ khám:</span> {searchResult.doctor}
              </div>
            </div>
          </Card>

          {/* Diagnosis */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Chẩn Đoán</h3>
            </div>
            <p className="text-lg text-gray-700">{searchResult.diagnosis}</p>
          </Card>

          {/* Examination Results */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Kết Quả Khám</h3>
            </div>

            <div className="space-y-6">
              {searchResult.examResults.map((result, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 space-y-2">
                  <div className="font-semibold text-gray-800">
                    {result.type === "Khám lâm sàng" ? (
                      <span className="text-blue-800">🔍 {result.type}</span>
                    ) : (
                      result.type
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{result.date}</div>
                  <div className="text-gray-700 mb-2">{result.result}</div>

                  {/* Đính kèm */}
                  {result.attachments?.length > 0 && (
                    <div className="space-y-2">
                      {result.attachments.map((file, i) => (
                        <div key={i}>
                          <div className="text-sm text-gray-600 italic">{file.description}</div>
                          {file.type.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.description}
                              className="max-w-full h-auto rounded shadow border"
                            />
                          ) : (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-1 text-blue-600 underline"
                            >
                              Xem tài liệu ({file.type})
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Lab Results */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Kết Quả Xét Nghiệm</h3>
            </div>

            <div className="space-y-4">
              {searchResult.labResults.map((result, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4">
                  <div className="font-semibold text-gray-800">{result.type}</div>
                  <div className="text-sm text-gray-600 mb-2">{result.date}</div>
                  <div className="text-gray-700">{result.result}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-bold text-gray-800">Kết Luận Sau Khám</h3>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Tóm tắt:</span>
                <p className="text-gray-800 mt-1">{searchResult.conclusion.summary}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Hướng dẫn / Lời dặn:</span>
                <p className="text-gray-800 mt-1">{searchResult.conclusion.recommendation}</p>
              </div>
            </div>
          </Card>

          {/* Prescription */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-800">Đơn Thuốc</h3>
            </div>

            <table className="w-full table-auto border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">STT</th>
                  <th className="border px-2 py-1">Tên thuốc</th>
                  <th className="border px-2 py-1">Liều dùng</th>
                  <th className="border px-2 py-1">Số lượng</th>
                  <th className="border px-2 py-1">Cách dùng</th>
                  <th className="border px-2 py-1">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.prescription.map((med, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">
                      <div className="font-semibold">{med.medicineName}</div>
                      <div className="text-xs text-gray-500">{med.activeIngredient} • {med.strength} • {med.form}</div>
                    </td>
                    <td className="border px-2 py-1">{med.dosage} • {med.frequency} • {med.duration}</td>
                    <td className="border px-2 py-1 text-center">{med.quantity}</td>
                    <td className="border px-2 py-1">{med.route}</td>
                    <td className="border px-2 py-1">{med.usageNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResultLookup;

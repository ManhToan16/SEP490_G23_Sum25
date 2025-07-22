namespace SEP490_BE.Constants
{
    public class MessageConstants
    {
        #region System Exception
        public const string UNCATEGORIZED_ERROR = "Đã xảy ra lỗi.";
        public const string VALIDATION_ERROR = "Dữ liệu không hợp lệ.";
        public const string CONFLICT_ERROR = "Dữ liệu bị xung đột.";
        public const string UNAUTHENTICATED_ERROR = "Chưa xác thực người dùng.";
        public const string UNAUTHORIZED_ERROR = "Bạn không có quyền truy cập.";
        public const string FORBIDDEN = "Truy cập bị từ chối.";
        public const string API_KEY_ERROR = "Thiếu hoặc sai API Key.";
        #endregion

        #region DB Exception
        public const string DB_ERROR = "Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.";
        public const string DB_CONCURRENCY_ERROR = "Dữ liệu đã bị thay đổi. Vui lòng tải lại.";

        #endregion

        #region Not Found
        public const string NOT_FOUND = "Không tìm thấy dữ liệu.";
        public const string ENDPOINT_NOT_FOUND = "Không tìm thấy đường dẫn API.";
        public const string METHOD_NOT_FOUND = "Không tìm thấy phương thức.";
        public const string UNSUPPORTED_MEDIA_TYPE = "Định dạng nội dung không được hỗ trợ.";
        #endregion

        #region CRUD Common
        public const string GET_SUCCESS = "Lấy dữ liệu thành công.";
        public const string POST_SUCCESS = "Tạo dữ liệu thành công.";
        public const string PUT_SUCCESS = "Cập nhật dữ liệu thành công.";
        public const string DELETE_SUCCESS = "Xóa dữ liệu thành công.";
        #endregion

        #region Auth
        public const string LOGIN_SUCCESS = "Đăng nhập thành công.";
        public const string REGISTER_SUCCESS = "Đăng ký thành công.";
        public const string LOGOUT_SUCCESS = "Đăng xuất thành công.";
        public const string REFRESH_TOKEN_SUCCESS = "Làm mới token thành công.";

        public const string PHONE_NUMBER_VERIFIED_SUCCESS = "Xác thực số điện thoại thành công.";
        public const string PHONE_NUMBER_EXISTS = "Số điện thoại đã được đăng ký.";
        public const string INVALID_PHONE_NUMBER_CHARACTER = "Số điện thoại không đúng định dạng.";
        public const string INVALID_PHONE_NUMBER_LENGTH = "Số điện thoại phải gồm 10 chữ số.";

        public const string NULL_USERNAME = "Họ tên không được để trống.";
        public const string INVALID_USERNAME_CHARACTER = "Họ tên không được chứa ký tự đặc biệt.";
        public const string INVALID_USERNAME_LENGTH = "Họ tên phải từ 2 đến 100 ký tự.";

        public const string EMAIL_EXISTS = "Email đã được đăng ký.";
        public const string INVALID_EMAIL = "Địa chỉ email không đúng định dạng.";

        public const string INVALID_LOGIN = "Email hoặc mật khẩu không đúng.";
        public const string WRONG_OLD_PASSWORD = "Mật khẩu cũ không chính xác.";
        public const string INVALID_PASSWORD = "Mật khẩu phải có ít nhất 8 ký tự.";
        public const string INVALID_REPASSWORD = "Mật khẩu nhập lại phải trùng khớp.";
        public const string INVALID_TOKEN = "Token không hợp lệ.";
        public const string FORGOT_PASSWORD_REQUEST_SUCCESS = "Vui lòng kiểm tra email để đổi mật khẩu.";
        public const string CHANGE_PASSWORD_SUCCESS = "Đổi mật khẩu thành công.";
        #endregion

        #region User
        public const string USER_NOT_FOUND = "Không tìm thấy người dùng.";
        public const string DOCTOR_NOT_FOUND = "Không tìm thấy bác sĩ.";
        #endregion

        #region Role
        public const string ROLE_NOT_FOUND = "Không tìm thấy vai trò.";
        #endregion

        #region Patient Profile
        public const string PATIENT_PROTILE_NOT_FOUND = "Không tìm thấy hồ sơ bệnh nhân.";
        public const string PATIENT_PROTILE_EXISTS = "CCCD này đã được đăng ký.";
        #endregion

        #region Appointment
        public const string APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn.";
        public const string APPOINTMENT_INVALID_UPDATE = "Có lỗi xảy ra khi cập nhật lịch hẹn.";
        public const string APPOINTMENT_EXPIRED = "Lịch hẹn này đã hết hạn, không thể tạo lượt khám.";
        public const string APPOINTMENT_INVALID_DATE_CREATE_VISIT = "Chỉ được tạo lượt khám trong ngày đã hẹn.";
        public const string APPOINTMENT_INVALID_STATUS_CREATE_VISIT = "Không thể tạo lượt khám cho lịch hẹn này.";
        #endregion

        #region Visit
        public const string VISIT_NOT_FOUND = "Không tìm thấy lượt khám.";
        public const string VISIT_INVALID_COMPLETED = "Không thể hoàn thành lượt khám khi bệnh nhân chưa hoàn thành tất cả chỉ định và quay trở về phòng khám tống quát.";
        public const string VISIT_INVALID_CALLING = "Lỗi khi gọi bệnh nhân.";
        public const string VISIT_CONFLICT = "Lịch hẹn này đã được tạo lượt khám.";
        #endregion

        #region Assignment
        public const string ASSIGNMENT_NOT_FOUND = "Không tìm thấy chỉ định.";
        public const string ASSIGNMENT_SERVICE_INVALID = "Một hoặc vài dịch vụ được chọn cho chỉ định đã gặp lỗi.";
        public const string ASSIGNMENT_INVALID_CALLING = "Bệnh nhân chưa thanh toán.";
        #endregion

        #region Timeslot
        public const string TIMESLOT_NOT_FOUND = "Không tìm thấy ca khám.";
        #endregion

        #region Room
        public const string EXAM_ROOM_NOT_FOUND = "Không tìm thấy phòng khám tổng quát.";
        public const string LABO_ROOM_NOT_FOUND = "Không tìm thấy phòng xét nghiệm.";
        #endregion

        #region Medical Record
        public const string MEDICAL_RECORD_NOT_FOUND = "Không tìm thấy hồ sơ bệnh án.";
        public const string MEDICAL_RECORD_CONFLICT = "Hồ sơ bệnh án đã tồn tại.";
        #endregion

        #region Exam Result
        public const string EXAMINATION_RESULT_NOT_FOUND = "Không tìm thấy phiếu kết quả khám tổng quát.";
        public const string EXAMINATION_RESULT_CONFLICT = "Phiếu kết quả khám tổng quát đã được tạo trước đó.";
        public const string EXAMINATION_RESULT_INVALID_UPDATE = "Không thể cập nhật phiếu kết quả khám tổng quát đã HOÀN THÀNH.";
        public const string EXAMINATION_RESULT_MEDICAL_RECORD_NOT_FOUND = "Bệnh nhân chưa có hồ sơ bệnh án, hãy tạo hồ sơ bệnh án cho bệnh nhân trước.";
        #endregion

        #region Prescription
        public const string PRESCRIPTION_NOT_FOUND = "Không tìm thấy đơn thuốc.";
        public const string PRESCRIPTION_INVALID_UPDATE = "Không thể cập nhật phiếu đơn thuốc.";
        #endregion

        #region Labo Result
        public const string LABORATORY_RESULT_NOT_FOUND = "Không tìm thấy phiếu kết quả xét nghiệm.";
        public const string LABORATORY_RESULT_INVALID_UPDATE = "Không thể cập nhật kết quả xét nghiệm";
        #endregion

        #region File
        public const string UPLOAD_SUCCESS = "Tải tệp lên thành công.";
        #endregion

    }
}

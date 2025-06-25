-- Tạo cơ sở dữ liệu
CREATE DATABASE KhanhAnNeurologyClinic;
GO

-- Sử dụng cơ sở dữ liệu
USE KhanhAnNeurologyClinic;
GO

-- Create Users Table
CREATE TABLE Users (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   PhoneNumber NVARCHAR(10) UNIQUE NOT NULL,
   Password NVARCHAR(255) NOT NULL,
   Email NVARCHAR(100),
   DateOfBirth DATE NOT NULL,
   Gender NVARCHAR(10) NOT NULL,
   Address NVARCHAR(255),
   IsActive BIT DEFAULT 1,
   CreatedAt DATETIME DEFAULT GETDATE()
);
-- Create Roles Table
CREATE TABLE Roles (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(200)
);
-- Create Permissions Table
CREATE TABLE Permissions (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(255)
);
-- Create Tokens Table
CREATE TABLE Tokens (
   Id NVARCHAR(100) PRIMARY KEY,
   UserId NVARCHAR(100) NOT NULL,
   RefreshToken NVARCHAR(500) NOT NULL UNIQUE,
   JwtId NVARCHAR(255) NOT NULL,
   IsUsed BIT DEFAULT 0,
   IsRevoked BIT DEFAULT 0,
   ExpiresAt DATETIME NOT NULL,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
-- Create AuditLogs Table
CREATE TABLE AuditLogs (
   Id INT PRIMARY KEY IDENTITY(1,1),
   UserId NVARCHAR(100),
   Action NVARCHAR(50),
   TableName NVARCHAR(50) NOT NULL,
   RecordId NVARCHAR(100) NOT NULL,
   OldData NVARCHAR(MAX),
   NewData NVARCHAR(MAX),
   ActionTime DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (UserId) REFERENCES Users(Id)
);
-- Create Clinics Table
CREATE TABLE Clinics (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   Address NVARCHAR(255) NOT NULL,
   Description NVARCHAR(Max)
);
-- Create Departments Table
CREATE TABLE Departments (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   ClinicId NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max),
   FOREIGN KEY (ClinicId) REFERENCES Clinics(Id)
);
-- Create Rooms Table
CREATE TABLE Rooms (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   DepartmentId NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max),
   FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);
-- Create Services Table
CREATE TABLE [Services] (
   Id NVARCHAR(100) PRIMARY KEY,
   DepartmentId NVARCHAR(100) NOT NULL,
   Name NVARCHAR(100) NOT NULL,
   Price DECIMAL(18,2),
   Description NVARCHAR(Max),
   FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);
-- Create DoctorProfiles Table
CREATE TABLE DoctorProfiles (
   Id NVARCHAR(100) PRIMARY KEY,
   DoctorId NVARCHAR(100) NOT NULL,
   DepartmentId NVARCHAR(100) NOT NULL,
   Qualifications NVARCHAR(255),
   YearsOfExperience INT,
   Biography NVARCHAR(MAX),
   AverageRating DECIMAL(3,1) DEFAULT 0,
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);
-- Create DoctorSchedules Table
CREATE TABLE DoctorSchedules (
   Id NVARCHAR(100) PRIMARY KEY,
   DoctorId NVARCHAR(100) NOT NULL,
   RoomId NVARCHAR(100) NOT NULL,
   Date DATE NOT NULL,
   StartTime TIME NOT NULL,
   EndTime TIME NOT NULL,
   IsAvailable BIT DEFAULT 1,
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (RoomId) REFERENCES Rooms(Id)
);
-- Create Appointments Table
CREATE TABLE Appointments (
   Id NVARCHAR(100) PRIMARY KEY,
   PatientId NVARCHAR(100) NOT NULL,
   ClinicId NVARCHAR(100) NOT NULL,
   RequiredDoctorId NVARCHAR(100),
   AssignedDoctorId NVARCHAR(100) NOT NULL,
   Date DATE NOT NULL,
   Time TIME NOT NULL,
   Symptom NVARCHAR(MAX),
   IsCheckedIn BIT DEFAULT 0,
   Status NVARCHAR(50) DEFAULT 'Pending', -- Status: Pending, CheckedIn, Completed, Cancelled
   TotalPrice DECIMAL(18,2) DEFAULT 0,
   ExpiredAt DATETIME,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientId) REFERENCES Users(Id),
   FOREIGN KEY (ClinicId) REFERENCES Clinics(Id),
   FOREIGN KEY (RequiredDoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AssignedDoctorId) REFERENCES Users(Id)
);
-- Create DoctorReviews Table
CREATE TABLE DoctorReviews (
   Id NVARCHAR(100) PRIMARY KEY,
   PatientId NVARCHAR(100) NOT NULL,
   DoctorId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
   Comment NVARCHAR(Max),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientId) REFERENCES Users(Id),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);
-- Create Queues Table
CREATE TABLE Queues (
   Id NVARCHAR(100) PRIMARY KEY,
   RoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2),
   IsPrioritized BIT DEFAULT 0,
   QueueNumber INT NOT NULL,
   Status NVARCHAR(50) DEFAULT 'Waiting', -- Waiting, Current, Completed, Recalled, Skipped
   CalledAt DATETIME,
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (RoomId) REFERENCES Rooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);
-- Create MedicalRecords Table
CREATE TABLE MedicalRecords (
   Id NVARCHAR(100) PRIMARY KEY,
   PatientId NVARCHAR(100) NOT NULL,
   DoctorId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   Diagnosis NVARCHAR(MAX),
   Treatment NVARCHAR(MAX),
   IsCompleted BIT DEFAULT 0,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientId) REFERENCES Users(Id),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);
-- Create MedicalForms Table
CREATE TABLE MedicalForms (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalRecordId NVARCHAR(100) NOT NULL,
   Description NVARCHAR(MAX),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);
-- Create ExaminationImages Table
CREATE TABLE ExaminationImages (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalFormId NVARCHAR(100) NOT NULL,
   ImageUrl NVARCHAR(255) NOT NULL,
   Description NVARCHAR(255),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalFormId) REFERENCES MedicalForms(Id)
);
-- Create XRayImages Table
CREATE TABLE XRayImages (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalFormId NVARCHAR(100) NOT NULL,
   ImageUrl NVARCHAR(255) NOT NULL,
   Description NVARCHAR(Max),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalFormId) REFERENCES MedicalForms(Id)
);
-- Create Prescriptions Table
CREATE TABLE Prescriptions (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalRecordId NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);
-- Create PrescriptionItems Table
CREATE TABLE PrescriptionItems (
   Id NVARCHAR(100) PRIMARY KEY,
   PrescriptionId NVARCHAR(100) NOT NULL,
   Notes NVARCHAR(255),
   Description NVARCHAR(Max),
   FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(Id)
);
-- Create Notifications Table
CREATE TABLE Notifications (
   Id NVARCHAR(100) PRIMARY KEY,
   UserId NVARCHAR(100) NOT NULL,
   Title NVARCHAR(100) NOT NULL,
   Content NVARCHAR(MAX) NOT NULL,
   NotificationType NVARCHAR(50),
   IsRead BIT DEFAULT 0,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (UserId) REFERENCES Users(Id)
);
-- Create OTP Table
CREATE TABLE OTP (
   Id NVARCHAR(100) PRIMARY KEY,
   PhoneNumber NVARCHAR(11) NOT NULL,
   OtpCode NVARCHAR(6) NOT NULL,
   ExpiredAt DATETIME NOT NULL,
   IsUsed BIT DEFAULT 0,
   CreatedAt DATETIME DEFAULT GETDATE()
);
-- Create UserRoles Table
CREATE TABLE UserRoles (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   UserId NVARCHAR(100) NOT NULL,
   RoleName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE
);
-- Create RolePermissions Table
CREATE TABLE RolePermissions (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   RoleName NVARCHAR(50) NOT NULL,
   PermissionName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE,
   FOREIGN KEY (PermissionName) REFERENCES Permissions(Name) ON DELETE CASCADE
);
-- Create QueueServices Table
CREATE TABLE QueueServices (
   Id INT PRIMARY KEY IDENTITY(1,1),
   QueueId NVARCHAR(100) NOT NULL,
   ServiceId NVARCHAR(100) NOT NULL,
   FOREIGN KEY (QueueId) REFERENCES Queues(Id) ON DELETE CASCADE,
   FOREIGN KEY (ServiceId) REFERENCES Services(Id) ON DELETE CASCADE
);
GO 

INSERT INTO Roles (Name, Description)
VALUES
   ('ADMIN', N'Quản trị viên hệ thống với tất cả quyền hạn'),
   ('DOCTOR', N'Bác sĩ khám cho người bệnh và tạo hồ sơ bệnh án'),
   ('NURSE', N'Y tá hỗ trợ bác sĩ'),
   ('PATIENT', N'Bệnh nhân, có quyền xem lịch sử bệnh án và đặt lịch khám'),
   ('RECEPTIONIST', N'Lễ tân, quản lý lịch hẹn và hàng đợi bệnh nhân');
GO

INSERT INTO Permissions (Name, Description)
VALUES
    ('CREATE_ACCOUNT', N'Tạo hồ sơ người dùng mới'),
    ('READ_ACCOUNT', N'Xem thông tin người dùng'),
    ('UPDATE_ACCOUNT', N'Cập nhật thông tin người dùng'),
    ('DELETE_ACCOUNT', N'Xóa hồ sơ người dùng'),
	('ACTIVE_ACCOUNT', N'Bỏ chặn người dùng'),
    ('INACTIVE_ACCOUNT', N'Chặn người dùng'),

    ('CREATE_PATIENT', N'Tạo hồ sơ bệnh nhân mới (dành cho RECEPTIONIST)'),
    ('READ_PATIENT', N'Xem thông tin bệnh nhân (dành cho RECEPTIONIST)'),
    ('UPDATE_PATIENT', N'Cập nhật thông tin bệnh nhân (dành cho RECEPTIONIST)'),

	('CREATE_CLINIC', N'Tạo cơ sở mới'),
    ('READ_CLINIC', N'Xem thông tin cơ sở'),
    ('UPDATE_CLINIC', N'Cập nhật thông tin cơ sở'),
    ('DELETE_CLINIC', N'Xóa cơ sở'),

    ('CREATE_DEPARTMENT', N'Tạo phòng ban mới'),
    ('READ_DEPARTMENT', N'Xem thông tin phòng ban'),
    ('UPDATE_DEPARTMENT', N'Cập nhật thông tin phòng ban'),
    ('DELETE_DEPARTMENT', N'Xóa phòng ban'),

	('CREATE_SERVICE', N'Tạo dịch vụ mới'),
    ('READ_SERVICE', N'Xem dịch vụ'),
    ('UPDATE_SERVICE', N'Cập nhật dịch vụ'),
    ('DELETE_SERVICE', N'Xóa dịch vụ'),

    ('CREATE_ROOM', N'Tạo phòng khám mới'),
    ('READ_ROOM', N'Xem thông tin phòng khám'),
    ('UPDATE_ROOM', N'Cập nhật thông tin phòng khám'),
    ('DELETE_ROOM', N'Xóa phòng khám'),

	('CREATE_DOCTOR_SCHEDULE', N'Tạo lịch bác sĩ mới'),
    ('UPDATE_DOCTOR_SCHEDULE', N'Cập nhật lịch bác sĩ'),

	('CREATE_DOCTOR_PROFILE', N'Tạo thông tin bác sĩ'),
    ('UPDATE_DOCTOR_PROFILE', N'Cập nhật thông tin bác sĩ'),
	('DELETE_DOCTOR_PROFILE', N'Xoá thông tin bác sĩ'),

    ('CREATE_APPOINTMENT', N'Tạo lịch hẹn mới'),
    ('READ_APPOINTMENT', N'Xem lịch hẹn'),
	('CANCEL_APPOINTMENT', N'Huỷ lịch hẹn'),
    ('UPDATE_APPOINTMENT', N'Cập nhật lịch hẹn'),

	('CREATE_QUEUE', N'Tạo số thứ tự khám mới'),
    ('READ_QUEUE', N'Xem số thứ tự khám'),
    ('UPDATE_QUEUE', N'Cập nhật số thứ tự khám'),

	('CREATE_MEDICAL_RECORD', N'Tạo hồ sơ bệnh án mới'),
    ('READ_MEDICAL_RECORD', N'Xem thông tin hồ sơ bệnh án'),
	('UPDATE_MEDICAL_RECORD', N'Cập nhật thông tin hồ sơ bệnh án'),

    ('CREATE_MEDICAL_FORM', N'Tạo phiếu khám mới'),
    ('READ_MEDICAL_FORM', N'Xem thông tin phiếu khám'),
    ('UPDATE_MEDICAL_FORM', N'Cập nhật thông tin phiếu khám'),

    ('CREATE_PRESCRIPTION', N'Tạo đơn thuốc mới'),
    ('READ_PRESCRIPTION', N'Xem thông tin đơn thuốc'),
    ('UPDATE_PRESCRIPTION', N'Cập nhật thông tin đơn thuốc'),
    ('DELETE_PRESCRIPTION', N'Xóa đơn thuốc'),

    ('CREATE_DOCTOR_REVIEW', N'Tạo đánh giá cho bác sĩ');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('ADMIN', 'CREATE_ACCOUNT'),
	('ADMIN', 'READ_ACCOUNT'),
	('ADMIN', 'UPDATE_ACCOUNT'),
	('ADMIN', 'DELETE_ACCOUNT'),
	('ADMIN', 'ACTIVE_ACCOUNT'),
	('ADMIN', 'INACTIVE_ACCOUNT'),

	('ADMIN', 'CREATE_CLINIC'),
	('ADMIN', 'READ_CLINIC'),
	('ADMIN', 'UPDATE_CLINIC'),
	('ADMIN', 'DELETE_CLINIC'),

	('ADMIN', 'CREATE_DEPARTMENT'),
	('ADMIN', 'READ_DEPARTMENT'),
	('ADMIN', 'UPDATE_DEPARTMENT'),
	('ADMIN', 'DELETE_DEPARTMENT'),

	('ADMIN', 'CREATE_SERVICE'),
	('ADMIN', 'READ_SERVICE'),
	('ADMIN', 'UPDATE_SERVICE'),
	('ADMIN', 'DELETE_SERVICE'),

	('ADMIN', 'CREATE_DOCTOR_PROFILE'),
	('ADMIN', 'UPDATE_DOCTOR_PROFILE'),
	('ADMIN', 'DELETE_DOCTOR_PROFILE'),

	('ADMIN', 'READ_APPOINTMENT'),
	('ADMIN', 'READ_QUEUE'),
	('ADMIN', 'READ_MEDICAL_RECORD'),
	('ADMIN', 'READ_MEDICAL_FORM');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('RECEPTIONIST', 'CREATE_PATIENT'),
	('RECEPTIONIST', 'READ_PATIENT'),
	('RECEPTIONIST', 'UPDATE_PATIENT'),

	('RECEPTIONIST', 'CREATE_APPOINTMENT'),
	('RECEPTIONIST', 'UPDATE_APPOINTMENT'),
	('RECEPTIONIST', 'READ_APPOINTMENT'),
	('RECEPTIONIST', 'CANCEL_APPOINTMENT'),

	('RECEPTIONIST', 'CREATE_QUEUE'),
	('RECEPTIONIST', 'UPDATE_QUEUE'),
	('RECEPTIONIST', 'READ_QUEUE');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
	('DOCTOR', 'CREATE_DOCTOR_SCHEDULE'),
	('DOCTOR', 'UPDATE_DOCTOR_SCHEDULE'),
	('DOCTOR', 'UPDATE_DOCTOR_PROFILE'),

	('DOCTOR', 'CREATE_APPOINTMENT'),
	('DOCTOR', 'UPDATE_APPOINTMENT'),

	('DOCTOR', 'CREATE_QUEUE'),
	('DOCTOR', 'UPDATE_QUEUE'),
	('DOCTOR', 'READ_QUEUE'),
	
	('DOCTOR', 'CREATE_MEDICAL_RECORD'),
	('DOCTOR', 'UPDATE_MEDICAL_RECORD'),
	('DOCTOR', 'READ_MEDICAL_RECORD'),

	('DOCTOR', 'CREATE_MEDICAL_FORM'),
	('DOCTOR', 'UPDATE_MEDICAL_FORM'),
	('DOCTOR', 'READ_MEDICAL_FORM'),

	('DOCTOR', 'CREATE_PRESCRIPTION'),
	('DOCTOR', 'UPDATE_PRESCRIPTION'),
	('DOCTOR', 'READ_PRESCRIPTION'),
	('DOCTOR', 'DELETE_PRESCRIPTION');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
	('PATIENT', 'CREATE_APPOINTMENT'),
	('PATIENT', 'READ_APPOINTMENT'),
	('PATIENT', 'CANCEL_APPOINTMENT'),

    ('PATIENT', 'READ_QUEUE'),
	('PATIENT', 'READ_MEDICAL_RECORD'),
	('PATIENT', 'READ_MEDICAL_FORM'),
	('PATIENT', 'READ_PRESCRIPTION'),

	('PATIENT', 'CREATE_DOCTOR_REVIEW');
GO


use master
-- Xóa cơ sở dữ liệu nếu tồn tại
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'KhanhAnNeurologyClinic')
BEGIN
    ALTER DATABASE KhanhAnNeurologyClinic SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE KhanhAnNeurologyClinic;
END
GO

CREATE DATABASE KhanhAnNeurologyClinic;
GO

USE KhanhAnNeurologyClinic;
GO

CREATE TABLE Users (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   PhoneNumber NVARCHAR(10) UNIQUE NOT NULL,
   Password NVARCHAR(255) NOT NULL,
   Email NVARCHAR(100) NOT NULL,
   DateOfBirth DATE NOT NULL,
   Gender NVARCHAR(10) NOT NULL,
   Address NVARCHAR(255),
   IsActive BIT DEFAULT 1,
   CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Roles (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(200)
);

CREATE TABLE Permissions (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(255)
);

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

CREATE TABLE DoctorProfiles (
   Id NVARCHAR(100) PRIMARY KEY,
   DoctorId NVARCHAR(100) NOT NULL,
   Qualifications NVARCHAR(255),
   YearsOfExperience INT,
   Biography NVARCHAR(MAX),
   [Avatar] NVARCHAR(MAX),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
);

CREATE TABLE ExaminationRooms (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max)
);

CREATE TABLE LaboratoryRooms (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max)
);

CREATE TABLE [Services] (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryRoomsId NVARCHAR(100) NOT NULL,
   Name NVARCHAR(100) NOT NULL,
   Price DECIMAL(18,2),
   Description NVARCHAR(Max),
   FOREIGN KEY (LaboratoryRoomsId) REFERENCES LaboratoryRooms(Id)
);

CREATE TABLE DoctorSchedules (
   Id NVARCHAR(100) PRIMARY KEY,
   DoctorId NVARCHAR(100) NOT NULL,
   ExaminationRoomId NVARCHAR(100) NOT NULL,
   Date DATE NOT NULL,
   StartTime TIME NOT NULL,
   EndTime TIME NOT NULL,
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (ExaminationRoomId) REFERENCES ExaminationRooms(Id)
);

CREATE TABLE TechnicianSchedules (
   Id NVARCHAR(100) PRIMARY KEY,
   TechnicianId NVARCHAR(100) NOT NULL,
   LaboratoryRoomId NVARCHAR(100) NOT NULL,
   Date DATE NOT NULL,
   StartTime TIME NOT NULL,
   EndTime TIME NOT NULL,
   FOREIGN KEY (TechnicianId) REFERENCES Users(Id),
   FOREIGN KEY (LaboratoryRoomId) REFERENCES LaboratoryRooms(Id)
);

CREATE TABLE PatientProfiles (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   CitizenId NVARCHAR(20) NOT NULL UNIQUE,
   PhoneNumber NVARCHAR(10) NOT NULL,
   Email NVARCHAR(100) NOT NULL,
   DateOfBirth DATE NOT NULL,
   Gender NVARCHAR(10) NOT NULL,
   Address NVARCHAR(255),
   CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Appointments (
   Id NVARCHAR(100) PRIMARY KEY,
   PatientProfileId NVARCHAR(100),
   Name NVARCHAR(100) NOT NULL,
   PhoneNumber NVARCHAR(10) NOT NULL,
   Email NVARCHAR(100) NOT NULL,
   DateOfBirth DATE NOT NULL,
   Gender NVARCHAR(10) NOT NULL,
   Address NVARCHAR(255),
   Symptom NVARCHAR(MAX),
   RequiredDoctorId NVARCHAR(100),
   AssignedDoctorId NVARCHAR(100) NOT NULL,
   Date DATE NOT NULL,
   Time TIME NOT NULL,
   Status NVARCHAR(50) DEFAULT 'Pending', -- Status: Pending, CheckedIn, InProgress, Completed, Cancelled
   TotalPrice DECIMAL(18,2) DEFAULT 0,
   ExpiredAt DATETIME,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientProfileId) REFERENCES PatientProfiles(Id),
   FOREIGN KEY (RequiredDoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AssignedDoctorId) REFERENCES Users(Id)
);

CREATE TABLE Queues (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationRoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2),
   IsPrioritized BIT DEFAULT 0,
   QueueNumber INT NOT NULL,
   Status NVARCHAR(50) DEFAULT 'Waiting', -- Status: Waiting, Called, InLaboratory, Returning, Completed, 
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationRoomId) REFERENCES ExaminationRooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

CREATE TABLE Assignments (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryRoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2),
   IsPrioritized BIT DEFAULT 0,
   Status NVARCHAR(50) DEFAULT 'Waiting', -- Status: Pending, Completed, 
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (LaboratoryRoomId) REFERENCES LaboratoryRooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

CREATE TABLE MedicalRecords (
   Id NVARCHAR(100) PRIMARY KEY,
   PatientProfileId NVARCHAR(100) NOT NULL,
   MedicalHistory NVARCHAR(MAX),
   Allergies NVARCHAR(MAX),
   SurgicalHistory NVARCHAR(MAX),
   Treatment NVARCHAR(MAX),
   CurrentMedications NVARCHAR(MAX),
   UpdatedAt DATETIME DEFAULT GETDATE(),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientProfileId) REFERENCES PatientProfiles(Id)
);

CREATE TABLE ExaminationResults (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalRecordId NVARCHAR(100) NOT NULL,
   DoctorId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   Summary NVARCHAR(MAX),
   Conclusion NVARCHAR(MAX),
   IsCompleted BIT DEFAULT 0,
   AccessCode NVARCHAR(50) UNIQUE,
   UpdatedAt DATETIME DEFAULT GETDATE(),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

CREATE TABLE LaboratoryResults (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationResultId NVARCHAR(100) NOT NULL,
   TechnicianId NVARCHAR(100) NOT NULL,
   AssignmentId NVARCHAR(100) NOT NULL,
   Note NVARCHAR(MAX),
   UpdatedAt DATETIME DEFAULT GETDATE(),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationResultId) REFERENCES ExaminationResults(Id),
   FOREIGN KEY (TechnicianId) REFERENCES Users(Id),
   FOREIGN KEY (AssignmentId) REFERENCES Assignments(Id)
);

CREATE TABLE LaboratoryFiles (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryResultId NVARCHAR(100) NOT NULL,
   Url NVARCHAR(255) NOT NULL,
   FOREIGN KEY (LaboratoryResultId) REFERENCES LaboratoryResults(Id)
);

CREATE TABLE Prescriptions (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationResultId NVARCHAR(100) NOT NULL,
   Note NVARCHAR(Max),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationResultId) REFERENCES ExaminationResults(Id)
);

CREATE TABLE PrescriptionItems (
   Id NVARCHAR(100) PRIMARY KEY,
   PrescriptionId NVARCHAR(100) NOT NULL,
   DrugName NVARCHAR(255),
   Dosage NVARCHAR(255),
   Frequency NVARCHAR(255),
   Duration NVARCHAR(255),
   Instructions NVARCHAR(Max),
   FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(Id)
);

CREATE TABLE Materials (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(255) NOT NULL,
   Code NVARCHAR(50),
   Category NVARCHAR(100),
   Unit NVARCHAR(50) NOT NULL,
   QuantityInStock INT NOT NULL,
   UpdatedAt DATETIME DEFAULT GETDATE(),
   CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE UserRoles (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   UserId NVARCHAR(100) NOT NULL,
   RoleName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE
);

CREATE TABLE RolePermissions (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   RoleName NVARCHAR(50) NOT NULL,
   PermissionName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE,
   FOREIGN KEY (PermissionName) REFERENCES Permissions(Name) ON DELETE CASCADE
);

CREATE TABLE AssignmentServices (
   Id INT PRIMARY KEY IDENTITY(1,1),
   AssignmentId NVARCHAR(100) NOT NULL,
   ServiceId NVARCHAR(100) NOT NULL,
   FOREIGN KEY (AssignmentId) REFERENCES Assignments(Id) ON DELETE CASCADE,
   FOREIGN KEY (ServiceId) REFERENCES Services(Id) ON DELETE CASCADE
);
GO 

INSERT INTO Roles (Name, Description)
VALUES
   ('ADMIN', N'Quản trị viên'),
   ('DOCTOR', N'Bác sĩ'),
   ('TECHNICIAN', N'Kỹ thuật vien'),
   ('RECEPTIONIST', N'Lễ tân');
GO

INSERT INTO Permissions (Name, Description)
VALUES
    ('CREATE_USER', N'Tạo hồ sơ người dùng mới'),
    ('READ_USER', N'Xem thông tin người dùng'),
    ('UPDATE_USER', N'Cập nhật thông tin người dùng'),
    ('DELETE_USER', N'Xóa hồ sơ người dùng'),
	('ACTIVATE_USER', N'Bỏ chặn người dùng'),
    ('SUSPEND_USER', N'Chặn người dùng'),
	
	('CREATE_DOCTOR_SCHEDULE', N'Tạo lịch bác sĩ mới'),
    ('UPDATE_DOCTOR_SCHEDULE', N'Cập nhật lịch bác sĩ'),
	('DELETE_DOCTOR_SCHEDULE', N'Xoá lịch bác sĩ'),

	('CREATE_DOCTOR_PROFILE', N'Tạo thông tin bác sĩ'),
    ('UPDATE_DOCTOR_PROFILE', N'Cập nhật thông tin bác sĩ'),
	('DELETE_DOCTOR_PROFILE', N'Xoá thông tin bác sĩ'),

	('CREATE_ROOM', N'Tạo phòng khám mới'),
    ('READ_ROOM', N'Xem thông tin phòng khám'),
    ('UPDATE_ROOM', N'Cập nhật thông tin phòng khám'),
    ('DELETE_ROOM', N'Xóa phòng khám'),

	('CREATE_SERVICE', N'Tạo dịch vụ mới'),
    ('READ_SERVICE', N'Xem dịch vụ'),
    ('UPDATE_SERVICE', N'Cập nhật dịch vụ'),
    ('DELETE_SERVICE', N'Xóa dịch vụ'),

	('CREATE_MATERIAL', N'Tạo vật tư mới'),
    ('READ_MATERIAL', N'Xem vật tư'),
    ('UPDATE_MATERIAL', N'Cập nhật vật tư'),
    ('DELETE_MATERIAL', N'Xóa vật tư'),

    ('CREATE_PATIENT', N'Tạo hồ sơ bệnh nhân mới (dành cho RECEPTIONIST)'),
    ('UPDATE_PATIENT', N'Cập nhật thông tin bệnh nhân (dành cho RECEPTIONIST)'),

    ('CREATE_APPOINTMENT', N'Tạo lịch hẹn mới'),
	('CANCEL_APPOINTMENT', N'Huỷ lịch hẹn'),
    ('UPDATE_APPOINTMENT', N'Cập nhật lịch hẹn'),

	('CREATE_QUEUE', N'Tạo số thứ tự khám mới'),
    ('UPDATE_QUEUE', N'Cập nhật số thứ tự khám'),

	('CREATE_ASSIGNMENT', N'Tạo chỉ định mới'),
    ('UPDATE_ASSIGNMENT', N'Cập nhật số thứ tự khám'),

	('CREATE_MEDICAL_RECORD', N'Tạo hồ sơ bệnh án mới'),
	('UPDATE_MEDICAL_RECORD', N'Cập nhật thông tin hồ sơ bệnh án'),

    ('CREATE_EXAMINATION_RESULT', N'Tạo phiếu khám mới'),
    ('UPDATE_EXAMINATION_RESULT', N'Cập nhật thông tin phiếu khám'),

	('CREATE_LABORATORY_RESULT', N'Tạo kết quả xét nghiệm mới'),
    ('UPDATE_LABORATORY_RESULT', N'Cập nhật kết quả xét nghiệm'),

    ('CREATE_PRESCRIPTION', N'Tạo đơn thuốc mới'),
    ('UPDATE_PRESCRIPTION', N'Cập nhật thông tin đơn thuốc')
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('ADMIN', 'CREATE_USER'),
	('ADMIN', 'READ_USER'),
	('ADMIN', 'UPDATE_USER'),
	('ADMIN', 'DELETE_USER'),
	('ADMIN', 'ACTIVATE_USER'),
	('ADMIN', 'SUSPEND_USER'),

	('ADMIN', 'CREATE_ROOM'),
	('ADMIN', 'READ_ROOM'),
	('ADMIN', 'UPDATE_ROOM'),
	('ADMIN', 'DELETE_ROOM'),

	('ADMIN', 'CREATE_SERVICE'),
	('ADMIN', 'READ_SERVICE'),
	('ADMIN', 'UPDATE_SERVICE'),
	('ADMIN', 'DELETE_SERVICE'),

	('ADMIN', 'CREATE_DOCTOR_PROFILE'),
	('ADMIN', 'UPDATE_DOCTOR_PROFILE'),
	('ADMIN', 'DELETE_DOCTOR_PROFILE'),

	('ADMIN', 'CREATE_MATERIAL'),
	('ADMIN', 'READ_MATERIAL'),
	('ADMIN', 'UPDATE_MATERIAL'),
	('ADMIN', 'DELETE_MATERIAL'),

	('ADMIN', 'CREATE_PATIENT'),
	('ADMIN', 'UPDATE_PATIENT');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('RECEPTIONIST', 'CREATE_PATIENT'),
	('RECEPTIONIST', 'UPDATE_PATIENT'),

	('RECEPTIONIST', 'CREATE_APPOINTMENT'),
	('RECEPTIONIST', 'UPDATE_APPOINTMENT'),
	('RECEPTIONIST', 'CANCEL_APPOINTMENT'),

	('RECEPTIONIST', 'CREATE_QUEUE'),
	('RECEPTIONIST', 'UPDATE_QUEUE'),

	('RECEPTIONIST', 'CREATE_MEDICAL_RECORD'),
	('RECEPTIONIST', 'UPDATE_MEDICAL_RECORD');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
	('DOCTOR', 'CREATE_DOCTOR_SCHEDULE'),
	('DOCTOR', 'UPDATE_DOCTOR_SCHEDULE'),
	('DOCTOR', 'DELETE_DOCTOR_SCHEDULE'),

	('DOCTOR', 'UPDATE_DOCTOR_PROFILE'),

	('DOCTOR', 'CREATE_APPOINTMENT'),
	('DOCTOR', 'UPDATE_APPOINTMENT'),

	('DOCTOR', 'UPDATE_QUEUE'),

	('DOCTOR', 'CREATE_ASSIGNMENT'),
	
	('DOCTOR', 'CREATE_MEDICAL_RECORD'),
	('DOCTOR', 'UPDATE_MEDICAL_RECORD'),

	('DOCTOR', 'CREATE_EXAMINATION_RESULT'),
	('DOCTOR', 'UPDATE_EXAMINATION_RESULT'),
	
	('DOCTOR', 'CREATE_PRESCRIPTION'),
	('DOCTOR', 'UPDATE_PRESCRIPTION');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
	('TECHNICIAN', 'UPDATE_ASSIGNMENT'),
	('TECHNICIAN', 'CREATE_LABORATORY_RESULT'),
	('TECHNICIAN', 'UPDATE_LABORATORY_RESULT');
GO



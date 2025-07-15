use master
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

--1
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

--2
CREATE TABLE Roles (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(200)
);

--3
CREATE TABLE Permissions (
   Name NVARCHAR(50) PRIMARY KEY,
   Description NVARCHAR(255)
);

--4
CREATE TABLE UserRoles (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   UserId NVARCHAR(100) NOT NULL,
   RoleName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE
);

--5
CREATE TABLE RolePermissions (
   Id INT IDENTITY(1,1) PRIMARY KEY,
   RoleName NVARCHAR(50) NOT NULL,
   PermissionName NVARCHAR(50) NOT NULL,
   FOREIGN KEY (RoleName) REFERENCES Roles(Name) ON DELETE CASCADE,
   FOREIGN KEY (PermissionName) REFERENCES Permissions(Name) ON DELETE CASCADE
);

--6
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

--7
CREATE TABLE DoctorProfiles (
   Id NVARCHAR(100) PRIMARY KEY,
   DoctorId NVARCHAR(100) NOT NULL,
   Qualifications NVARCHAR(255),
   YearsOfExperience INT,
   Biography NVARCHAR(MAX),
   [Avatar] NVARCHAR(MAX),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id)
);

--8
CREATE TABLE ExaminationRooms (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max)
);

--9
CREATE TABLE LaboratoryRooms (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   Description NVARCHAR(Max)
);

--10
CREATE TABLE TimeSlots (
  Id NVARCHAR(100) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  StartTime TIME NOT NULL,
  EndTime TIME NOT NULL,
  Description NVARCHAR(MAX)
);

--11
CREATE TABLE [Services] (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryRoomsId NVARCHAR(100) NOT NULL,
   Name NVARCHAR(100) NOT NULL,
   Price DECIMAL(18,2),
   Description NVARCHAR(Max),
   FOREIGN KEY (LaboratoryRoomsId) REFERENCES LaboratoryRooms(Id)
);

--12
CREATE TABLE Schedules (
  Id NVARCHAR(100) PRIMARY KEY,
  UserId NVARCHAR(100) NOT NULL,
  Role NVARCHAR(100) NOT NULL,
  RoomId NVARCHAR(100) NOT NULL,
  RoomType NVARCHAR (50) NOT NULL, -- EXAMINATION / LABORATORY
  Date DATE NOT NULL,
  TimeSlotId NVARCHAR(100) NOT NULL,
  Status NVARCHAR(50) DEFAULT 'SCHEDULED' 
    CHECK (Status IN (
      'SCHEDULED', 
      'PRESENT', 
      'ABSENT'
    )),
  FOREIGN KEY (UserId) REFERENCES Users(Id),
  FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id)
);

--13
CREATE TABLE ScheduleChangeRequests (
  Id NVARCHAR(100) PRIMARY KEY,
  RequesterId NVARCHAR(100) NOT NULL,
  RequesterScheduleId NVARCHAR(100) NOT NULL,
  TargetUserId NVARCHAR(100) NOT NULL,
  TargetScheduleId NVARCHAR(100) NOT NULL,
  Reason NVARCHAR(MAX) NOT NULL,
  Status NVARCHAR(50) DEFAULT 'PENDING' 
    CHECK (Status IN (
      'PENDING', 
      'APPROVED', 
      'REJECTED'
    )),
  FOREIGN KEY (RequesterId) REFERENCES Users(Id),
  FOREIGN KEY (TargetUserId) REFERENCES Users(Id),
  FOREIGN KEY (RequesterScheduleId) REFERENCES Schedules(Id),
  FOREIGN KEY (TargetScheduleId) REFERENCES Schedules(Id)
);

--14
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

--15
CREATE TABLE Appointments (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(100) NOT NULL,
   PhoneNumber NVARCHAR(10) NOT NULL,
   Email NVARCHAR(100) NOT NULL,
   DateOfBirth DATE NOT NULL,
   Gender NVARCHAR(10) NOT NULL,
   Address NVARCHAR(255),
   Symptom NVARCHAR(MAX),
   RequiredDoctorId NVARCHAR(100),
   Date DATE NOT NULL,
   TimeSlotId NVARCHAR(100) NOT NULL,
   Status NVARCHAR(50) DEFAULT 'WAITING_FOR_CONFIRMATION' 
     CHECK (Status IN (
       'WAITING_FOR_CONFIRMATION', 
       'WAITING_FOR_CHECK_IN', 
       'CHECKED_IN', 
       'IN_EXAMINATION_PROGRESS', 
       'PENDING',
	   'IN_LABORATORY_PROGRESS', 
       'COMPLETED', 
       'CANCELLED'
     )),
   TotalPrice DECIMAL(18,2) DEFAULT 0,
   ExpiredAt DATETIME,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (RequiredDoctorId) REFERENCES Users(Id),
   FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id)
);

--16
CREATE TABLE Visits (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationRoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   PatientProfileId NVARCHAR(100) NOT NULL,
   AssignedDoctorId NVARCHAR(100) NOT NULL,
   PatientName NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2) DEFAULT 200000,
   IsPrioritized BIT DEFAULT 0,
   QueueNumber INT NOT NULL,
   Status NVARCHAR(50) DEFAULT 'WAITING' 
     CHECK (Status IN (
       'WAITING', 
       'IN_EXAMINATION', 
	   'PENDING', 
       'IN_LABORATORY', 
       'RETURNING', 
       'COMPLETED',
	   'CANCELLED'
     )),
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationRoomId) REFERENCES ExaminationRooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id),
   FOREIGN KEY (PatientProfileId) REFERENCES PatientProfiles(Id),
   FOREIGN KEY (AssignedDoctorId) REFERENCES Users(Id)
);

--17
CREATE TABLE Assignments (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryRoomId NVARCHAR(100) NOT NULL,
   VisitId NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2),
   Status NVARCHAR(50) DEFAULT 'PENDING' 
     CHECK (Status IN (
       'PENDING', 
       'WAITING', 
       'IN_PROGRESS', 
       'COMPLETED',
	   'CANCELLED'
     )),
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (LaboratoryRoomId) REFERENCES LaboratoryRooms(Id),
   FOREIGN KEY (VisitId) REFERENCES Visits(Id)
);

--18
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

--19
CREATE TABLE ExaminationResults (
   Id NVARCHAR(100) PRIMARY KEY,
   MedicalRecordId NVARCHAR(100) NOT NULL,
   DoctorId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   Summary NVARCHAR(MAX),
   Conclusion NVARCHAR(MAX),
   AccessCode NVARCHAR(50) UNIQUE,
   UpdatedAt DATETIME DEFAULT GETDATE(),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id),
   FOREIGN KEY (DoctorId) REFERENCES Users(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

--20
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

--21
CREATE TABLE LaboratoryFiles (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryResultId NVARCHAR(100) NOT NULL,
   [Url] NVARCHAR(255) NOT NULL,
   FOREIGN KEY (LaboratoryResultId) REFERENCES LaboratoryResults(Id)
);

--22
CREATE TABLE Medicines (
   Id NVARCHAR(100) PRIMARY KEY,
   Name NVARCHAR(255) NOT NULL,
   ActiveIngredients NVARCHAR(MAX),
   Strength NVARCHAR(MAX), 
   Packaging NVARCHAR(50),
   Unit NVARCHAR(100), 
   Description NVARCHAR(MAX)
);

--23
CREATE TABLE Prescriptions (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationResultId NVARCHAR(100) NOT NULL,
   Note NVARCHAR(MAX),
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationResultId) REFERENCES ExaminationResults(Id)
);

--24
CREATE TABLE PrescriptionItems (
   Id NVARCHAR(100) PRIMARY KEY,
   PrescriptionId NVARCHAR(100) NOT NULL,
   MedicineId NVARCHAR(100) NOT NULL,
   Dosage NVARCHAR(255),
   Frequency NVARCHAR(255),
   Duration NVARCHAR(255),
   Instructions NVARCHAR(MAX),
   FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(Id),
   FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

--25
CREATE TABLE Categories (
  Id NVARCHAR(100) PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  Description NVARCHAR(MAX),
  UpdatedAt DATETIME DEFAULT GETDATE(),
  CreatedAt DATETIME DEFAULT GETDATE()
);

--26
CREATE TABLE Suppliers (
  Id NVARCHAR(100) PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  PhoneNumber NVARCHAR(10) NOT NULL,
  Email NVARCHAR(100),
  Address NVARCHAR(255),
  Description NVARCHAR(MAX),
  UpdatedAt DATETIME DEFAULT GETDATE(),
  CreatedAt DATETIME DEFAULT GETDATE()
);

--27
CREATE TABLE Materials (
  Id NVARCHAR(100) PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  CategoryId NVARCHAR(100) NOT NULL, 
  SupplierId NVARCHAR(100) NOT NULL, 
  Unit NVARCHAR(50) NOT NULL, 
  QuantityInStock INT NOT NULL CHECK (QuantityInStock >= 0),
  MaxQuantity INT,
  MinQuantity INT,
  UpdatedAt DATETIME DEFAULT GETDATE(),
  CreatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id),
  FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

--28
CREATE TABLE Transactions (
    Id NVARCHAR(100) PRIMARY KEY,
    MaterialId NVARCHAR(100) NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL CHECK (TransactionType IN ('IMPORT', 'EXPORT', 'PROVIDE', 'RETURN')),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    RoomId NVARCHAR(100), 
    RoomType NVARCHAR (50), -- EXAMINATION / LABORATORY
    UserId NVARCHAR(100) NOT NULL,
    Reason NVARCHAR(MAX) NULL, -- Lý do đổi trả (nếu TransactionType = RETURN)
    Status NVARCHAR(50) DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED')), 
    DefectiveQuantity INT NULL,
    Price DECIMAL(18, 2) NULL DEFAULT 0,
    SupplierId NVARCHAR(100) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaterialId) REFERENCES Materials(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id)
);

--29
CREATE TABLE TransactionHistory (
    Id NVARCHAR(100) PRIMARY KEY,
    TransactionId NVARCHAR(100) NOT NULL,
    OldQuantity INT NOT NULL,
	NewQuantity INT NOT NULL,
    OldReason NVARCHAR(MAX) NOT NULL,
	NewReason NVARCHAR(MAX) NOT NULL,
    ChangedBy NVARCHAR(100) NOT NULL,
    ChangedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TransactionId) REFERENCES Transactions(Id) ON DELETE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES Users(Id)
);


--30
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
   ('NURSE', N'Y tá'),
   ('RECEPTIONIST', N'Lễ tân');
GO

INSERT INTO Permissions (Name, Description)
VALUES
	('ADMIN_DASHBOAD', N'Trang admin'),
	('NURSE_DASHBOAD', N'Trang admin'),
	('RECEPTIONIST_DASHBOAD', N'Trang admin'),
	('DOCTOR_DASHBOAD', N'Trang admin'),
	('TECHNICIAN_DASHBOAD', N'Trang admin'),

	('MANAGE_USER', N'Quản lý người dùng'),
	('MANAGE_LOG', N'Quản lý log hệ thống'),
	('MANAGE_PATIENT', N'Quản lý hồ sơ bệnh nhân'),
	('MANAGE_SCHEDULE', N'Quản lý lịch làm việc'),
	('MANAGE_SCHEDULE_REQUEST', N'Quản lý đơn xin đổi lịch'),
	('MANAGE_DOCTOR', N'Quản lý hồ sơ bác sĩ'),
	('MANAGE_EXAMINATION_ROOM', N'Quản lý phòng khám'),
	('MANAGE_LABORATORY_ROOM', N'Quản lý phòng xét nghiệm'),
	('MANAGE_SERVICE', N'Quản lý các dịch vụ'),
	('MANAGE_APPOINTMENT', N'Quản lý lịch hẹn'),
	('MANAGE_VISIT', N'Quản lý lượt khám'),
	('MANAGE_ASSIGNMENT', N'Quản lý chỉ định'),
	('MANAGE_MEDICAL_RECORD', N'Quản lý người dùng'),
	('MANAGE_EXAMINATION_RESULT', N'Quản lý người dùng'),
	('MANAGE_LABORATORY_RESULT', N'Quản lý người dùng'),
	('MANAGE_MEDICINE', N'Quản lý người dùng'),
	('MANAGE_PRESCRIPTION', N'Quản lý người dùng'),
	('MANAGE_MATERIAL', N'Quản lý người dùng'),
	('MANAGE_SUPPLIER', N'Quản lý người dùng'),
	('MANAGE_CATEGORY', N'Quản lý người dùng'),
	('MANAGE_TRANSACTION', N'Quản lý người dùng')
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('ADMIN', 'ADMIN_DASHBOAD'),
    ('ADMIN', 'MANAGE_USER'),
    ('ADMIN', 'MANAGE_LOG'),
    ('ADMIN', 'MANAGE_PATIENT'),
    ('ADMIN', 'MANAGE_SCHEDULE'),
    ('ADMIN', 'MANAGE_SCHEDULE_REQUEST'),
    ('ADMIN', 'MANAGE_DOCTOR'),
    ('ADMIN', 'MANAGE_EXAMINATION_ROOM'),
    ('ADMIN', 'MANAGE_LABORATORY_ROOM'),
    ('ADMIN', 'MANAGE_SERVICE'),
    ('ADMIN', 'MANAGE_APPOINTMENT'),
    ('ADMIN', 'MANAGE_VISIT'),
    ('ADMIN', 'MANAGE_ASSIGNMENT'),
    ('ADMIN', 'MANAGE_MEDICAL_RECORD'),
    ('ADMIN', 'MANAGE_EXAMINATION_RESULT'),
    ('ADMIN', 'MANAGE_LABORATORY_RESULT'),
    ('ADMIN', 'MANAGE_MEDICINE'),
    ('ADMIN', 'MANAGE_PRESCRIPTION'),
    ('ADMIN', 'MANAGE_MATERIAL'),
    ('ADMIN', 'MANAGE_SUPPLIER'),
    ('ADMIN', 'MANAGE_CATEGORY'),
    ('ADMIN', 'MANAGE_TRANSACTION');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('DOCTOR', 'DOCTOR_DASHBOAD'),
	('DOCTOR', 'MANAGE_SCHEDULE'),
	('DOCTOR', 'MANAGE_SCHEDULE_REQUEST'),
	('DOCTOR', 'MANAGE_DOCTOR'),
    ('DOCTOR', 'MANAGE_PATIENT'),
    ('DOCTOR', 'MANAGE_APPOINTMENT'),
    ('DOCTOR', 'MANAGE_VISIT'),
    ('DOCTOR', 'MANAGE_ASSIGNMENT'),
    ('DOCTOR', 'MANAGE_MEDICAL_RECORD'),
    ('DOCTOR', 'MANAGE_EXAMINATION_RESULT'),
	('DOCTOR', 'MANAGE_LABORATORY_RESULT'),
    ('DOCTOR', 'MANAGE_PRESCRIPTION');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('NURSE', 'NURSE_DASHBOAD'),
    ('NURSE', 'MANAGE_PATIENT'),
	('NURSE', 'MANAGE_SCHEDULE'),
	('NURSE', 'MANAGE_SCHEDULE_REQUEST'),
    ('NURSE', 'MANAGE_APPOINTMENT'),
    ('NURSE', 'MANAGE_VISIT'),
    ('NURSE', 'MANAGE_ASSIGNMENT'),
	('NURSE', 'MANAGE_MATERIAL');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('RECEPTIONIST', 'RECEPTIONIST_DASHBOAD'),
	('RECEPTIONIST', 'MANAGE_SCHEDULE'),
	('RECEPTIONIST', 'MANAGE_SCHEDULE_REQUEST'),
    ('RECEPTIONIST', 'MANAGE_PATIENT'),
    ('RECEPTIONIST', 'MANAGE_APPOINTMENT'),
    ('RECEPTIONIST', 'MANAGE_VISIT');
GO

INSERT INTO RolePermissions (RoleName, PermissionName)
VALUES
    ('TECHNICIAN', 'TECHNICIAN_DASHBOAD'),
    ('TECHNICIAN', 'MANAGE_ASSIGNMENT'),
    ('TECHNICIAN', 'MANAGE_LABORATORY_RESULT');
GO

-- USER
INSERT INTO Users (Id, Name, PhoneNumber, Password, Email, DateOfBirth, Gender, Address, IsActive, CreatedAt)
VALUES
-- ADMIN
('de394cfc-7da7-4ab7-8a0f-a9e2bea629f4', N'Tài Khoản Admin', '0912345678', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'khanhanclinic@gmail.com', '1985-06-15', N'Nam', N'111A12, Nghách 15, Ngõ 4, Phương Mai, Đống Đa, Hà Nội', 1, GETDATE()),
-- DOCTOR
('8f62d494-ea4e-4a45-93f6-9536fa08561e', N'Trần Minh Quang', '0963657883', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'quangtmhe171602@fpt.edu.vn', '2003-09-14', N'Nam', N'Văn Quán, Q. Hà Đông, Hà Nội', 1, GETDATE()),
('1bb171ba-3851-4739-867a-274a50b7d2eb', N'Hồ Thuỷ Ngân', '0904567890', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'hothuyngan@clinic.vn', '1999-09-05', N'Nữ', N'36 Kim Mã, Q. Ba Đình, Hà Nội', 1, GETDATE()),
-- NURSE
('8f6e229b-a7e7-4ace-ba83-202047753542', N'Hoàng Minh Tâm', '0905678901', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'tamhoang@clinic.vn', '1992-03-22', N'Nam', N'45 Trần Duy Hưng, Q. Cầu Giấy, Hà Nội', 1, GETDATE()),
('e39f4a97-78b5-4c5e-9052-0466cf9bd2ba', N'Vũ Thị Hoa', '0906789012', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'hoavu@clinic.vn', '1994-11-11', N'Nữ', N'99 Xã Đàn, Q. Đống Đa, Hà Nội', 1, GETDATE()),
-- RECEPTIONIST
('a04272c3-cd67-4d88-ac91-0bdeba4848d3', N'Đỗ Văn Lâm', '0907890123', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'lamdo@clinic.vn', '1988-02-17', N'Nam', N'76 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội', 1, GETDATE()),
-- TECHNICIAN
('6b543c87-53a7-480c-8393-628438086ad5', N'Bùi Văn Khánh', '0909012345', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'khanhbui@clinic.vn', '1986-08-01', N'Nam', N'58 Giải Phóng, Q. Hoàng Mai, Hà Nội', 1, GETDATE()),
('e45ce9ab-a913-40df-9ce9-b112bb977a3f', N'Nguyễn Thị Hạnh', '0910123456', '$2b$12$XikVx2vYJSqdwupVLc/ipuL4pRM3qfudunzunS3bipMgQjuKMVbF.', 'hanhnguyen@clinic.vn', '1991-05-28', N'Nữ', N'10 Lê Duẩn, Q. Hoàn Kiếm, Hà Nội', 1, GETDATE());


INSERT INTO UserRoles (UserId, RoleName)
VALUES
-- ADMIN
('de394cfc-7da7-4ab7-8a0f-a9e2bea629f4', 'ADMIN'),
-- DOCTOR
('8f62d494-ea4e-4a45-93f6-9536fa08561e', 'DOCTOR'),
('1bb171ba-3851-4739-867a-274a50b7d2eb', 'DOCTOR'),
-- NURSE
('8f6e229b-a7e7-4ace-ba83-202047753542', 'NURSE'),
('e39f4a97-78b5-4c5e-9052-0466cf9bd2ba', 'NURSE'),
-- RECEPTIONIST
('a04272c3-cd67-4d88-ac91-0bdeba4848d3', 'RECEPTIONIST'),
-- TECHNICIAN
('6b543c87-53a7-480c-8393-628438086ad5', 'TECHNICIAN'),
('e45ce9ab-a913-40df-9ce9-b112bb977a3f', 'TECHNICIAN');

-- DOCTOR PROFILE
INSERT INTO DoctorProfiles (Id, DoctorId, Qualifications, YearsOfExperience, Biography, Avatar)
VALUES
-- Bác sĩ Trần Minh Quang
(NEWID(), '8f62d494-ea4e-4a45-93f6-9536fa08561e', 
 N'Bác sĩ chuyên khoa I Nội thần kinh - Đại học Y Hà Nội', 3, N'Bác sĩ Trần Minh Quang có kinh nghiệm trong chẩn đoán và điều trị các bệnh lý thần kinh như động kinh, đau nửa đầu, Parkinson và Alzheimer.', N''),
-- Bác sĩ Hồ Thuỷ Ngân
(NEWID(), '1bb171ba-3851-4739-867a-274a50b7d2eb', 
 N'Thạc sĩ Y học thần kinh - Đại học Y Dược TP.HCM', 5, N'Bác sĩ Hồ Thuỷ Ngân chuyên điều trị các bệnh về thần kinh trung ương và tâm lý như rối loạn lo âu, trầm cảm, và rối loạn giấc ngủ.', N'');

-- EXAMINATION ROOM
INSERT INTO ExaminationRooms (Id, Name, Description)
VALUES
  (NEWID(), N'Phòng Khám Tổng Quát A', N'Khám và tư vấn sức khỏe tổng quát'),
  (NEWID(), N'Phòng Khám Tổng Quát B', N'Khám và tư vấn sức khỏe tổng quát'),
  (NEWID(), N'Phòng Khám Tổng Quát C', N'Khám và tư vấn sức khỏe tổng quát'),
  (NEWID(), N'Phòng Khám Tổng Quát D', N'Khám và tư vấn sức khỏe tổng quát'),
  (NEWID(), N'Phòng Khám Tổng Quát E', N'Khám và tư vấn sức khỏe tổng quát');

-- LABORATORY ROOM
INSERT INTO LaboratoryRooms (Id, Name, Description)
VALUES
  ('880f1a3d-caf7-4a6f-b7ed-f2003ccbd963', N'Phòng điện não (EEG)', N'Đo hoạt động điện của não bộ'),
  ('dcdf9559-85ce-42ee-b76e-6de3cbfd3b0a', N'Phòng điện tim (ECG)', N'Đo điện tâm đồ để kiểm tra hoạt động tim'),
  ('f9ed9ac5-f934-4f69-9b97-ad934568d25c', N'Phòng điện cơ (EMG)', N'Đánh giá hoạt động cơ và thần kinh'),
  ('6aa604f3-6162-45f5-b43a-e4653a28bbf4', N'Phòng siêu âm Doppler', N'Đo lưu lượng máu trong mạch'),
  ('e62f07dc-c6b1-488d-83d3-3fec9efa78e0', N'Phòng siêu âm tổng quát', N'Chẩn đoán hình ảnh tổng quát'),
  ('f670761a-af77-4839-a518-de0890380520', N'Phòng test tâm lý', N'Đánh giá tâm lý và hành vi'),
  ('f79af452-5d9c-4508-b59d-8cb635c10430', N'Phòng lấy mẫu xét nghiệm', N'Lấy máu và mẫu sinh học');

-- Phòng điện não (EEG)
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), '880f1a3d-caf7-4a6f-b7ed-f2003ccbd963', N'Điện não đồ thường quy (EEG)', 350000, N'Đo hoạt động điện não để chẩn đoán động kinh, mất ngủ'),
  (NEWID(), '880f1a3d-caf7-4a6f-b7ed-f2003ccbd963', N'Điện não đồ giấc ngủ', 500000, N'Đánh giá sóng não trong khi ngủ để phát hiện rối loạn thần kinh');

-- Phòng điện tim (ECG)
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), 'dcdf9559-85ce-42ee-b76e-6de3cbfd3b0a', N'Điện tâm đồ nghỉ', 200000, N'Đánh giá nhịp tim và dẫn truyền điện tim'),
  (NEWID(), 'dcdf9559-85ce-42ee-b76e-6de3cbfd3b0a', N'Điện tâm đồ gắng sức', 450000, N'Kiểm tra chức năng tim khi vận động');

-- Phòng điện cơ (EMG)
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), 'f9ed9ac5-f934-4f69-9b97-ad934568d25c', N'Điện cơ kim', 450000, N'Đo hoạt động điện của cơ khi co hoặc nghỉ'),
  (NEWID(), 'f9ed9ac5-f934-4f69-9b97-ad934568d25c', N'Đo dẫn truyền thần kinh', 550000, N'Phát hiện rối loạn dẫn truyền thần kinh ngoại biên');

-- Phòng siêu âm Doppler
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), '6aa604f3-6162-45f5-b43a-e4653a28bbf4', N'Siêu âm Doppler mạch máu não', 500000, N'Đo vận tốc và dòng chảy trong mạch não'),
  (NEWID(), '6aa604f3-6162-45f5-b43a-e4653a28bbf4', N'Siêu âm Doppler mạch chi', 450000, N'Kiểm tra tắc nghẽn mạch chi trên/dưới');

-- Phòng siêu âm tổng quát
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), 'e62f07dc-c6b1-488d-83d3-3fec9efa78e0', N'Siêu âm bụng tổng quát', 300000, N'Đánh giá gan, thận, lách, tụy'),
  (NEWID(), 'e62f07dc-c6b1-488d-83d3-3fec9efa78e0', N'Siêu âm tuyến giáp', 250000, N'Kiểm tra kích thước, nhân giáp'),
  (NEWID(), 'e62f07dc-c6b1-488d-83d3-3fec9efa78e0', N'Siêu âm ổ bụng', 350000, N'Chẩn đoán bệnh lý đường tiết niệu, tiêu hoá');

 -- Phòng test tâm lý
 INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), 'f670761a-af77-4839-a518-de0890380520', N'Test lo âu – trầm cảm (PHQ-9/GAD-7)', 200000, N'Sàng lọc và đánh giá tình trạng tâm thần'),
  (NEWID(), 'f670761a-af77-4839-a518-de0890380520', N'Test trí nhớ và nhận thức (MMSE)', 250000, N'Đánh giá suy giảm trí nhớ'),
  (NEWID(), 'f670761a-af77-4839-a518-de0890380520', N'Test hành vi trẻ em (CARS/CBCL)', 400000, N'Phát hiện rối loạn phổ tự kỷ, tăng động');

-- Phòng lấy mẫu xét nghiệm
INSERT INTO Services (Id, LaboratoryRoomsId, Name, Price, Description) VALUES
  (NEWID(), 'f79af452-5d9c-4508-b59d-8cb635c10430', N'Lấy máu xét nghiệm cơ bản', 100000, N'Công đoạn lấy máu phục vụ các xét nghiệm thường quy'),
  (NEWID(), 'f79af452-5d9c-4508-b59d-8cb635c10430', N'Lấy dịch não tủy', 800000, N'Chẩn đoán viêm màng não, đa xơ cứng (theo chỉ định bác sĩ)');

-- TIMESLOTS
INSERT INTO TimeSlots (Id, Name, StartTime, EndTime, Description)
VALUES
  ('TS001', N'Ca Sáng', '08:00:00', '12:00:00', N'Khám buổi sáng từ 8h00 đến 12h00'),
  ('TS002', N'Ca Chiều', '13:00:00', '17:00:00', N'Khám buổi chiều từ 13h00 đến 17h00'),
  ('TS003', N'Ca Tối', '18:00:00', '22:00:00', N'Khám buổi tối từ 18h00 đến 22h');


-- SCHEDULE
INSERT INTO KhanhAnNeurologyClinic.dbo.Schedules (Id,UserId,[Role],RoomId,RoomType,[Date],TimeSlotId,Status) VALUES
	 (N'032b7408-808d-43cb-bfa4-91eb1bdb7584',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'EE5F53BD-7D98-40DF-ADB9-804EC04583DC',N'EXAMINATION','2025-07-13',N'TS002',N'SCHEDULED'),
	 (N'1f711a85-492b-47f8-b4c5-0ed25190fb54',N'1bb171ba-3851-4739-867a-274a50b7d2eb',N'DOCTOR',N'7358793E-64E8-4A7E-B154-59F74AE00865',N'EXAMINATION','2025-07-08',N'TS001',N'SCHEDULED'),
	 (N'2c58ffa3-239e-4284-ae94-5681fbc35e18',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'A6DEEDEF-ED5F-4835-92C2-4B6AEEC4E582',N'EXAMINATION','2025-07-11',N'TS002',N'SCHEDULED'),
	 (N'3d2da661-9051-4d37-ad54-523a14a78229',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'A6DEEDEF-ED5F-4835-92C2-4B6AEEC4E582',N'EXAMINATION','2025-07-12',N'TS002',N'SCHEDULED'),
	 (N'74cff2d1-2044-4157-8c3e-89f20e767da1',N'e39f4a97-78b5-4c5e-9052-0466cf9bd2ba',N'NURSE',N'EE5F53BD-7D98-40DF-ADB9-804EC04583DC',N'EXAMINATION','2025-07-09',N'TS001',N'SCHEDULED'),
	 (N'75f9e900-6596-40d5-a665-aae712cf1111',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'7358793E-64E8-4A7E-B154-59F74AE00865',N'EXAMINATION','2025-07-09',N'TS001',N'SCHEDULED'),
	 (N'778ae258-3adb-4cf9-9ddc-3b80ce4c0fe8',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'EE5F53BD-7D98-40DF-ADB9-804EC04583DC',N'EXAMINATION','2025-07-14',N'TS001',N'SCHEDULED'),
	 (N'97d5149b-7319-4ac2-964d-bbb519d3489b',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'DOCTOR',N'7358793E-64E8-4A7E-B154-59F74AE00865',N'EXAMINATION','2025-07-10',N'TS001',N'SCHEDULED'),
	 (N'988bbe82-3549-45ec-b996-6eb4c708c9db',N'e39f4a97-78b5-4c5e-9052-0466cf9bd2ba',N'NURSE',N'EE5F53BD-7D98-40DF-ADB9-804EC04583DC',N'EXAMINATION','2025-07-14',N'TS001',N'SCHEDULED'),
	 (N'ba6637d6-e448-4c5c-b4e9-c91d34e9a6c8',N'e39f4a97-78b5-4c5e-9052-0466cf9bd2ba',N'NURSE',N'EE5F53BD-7D98-40DF-ADB9-804EC04583DC',N'EXAMINATION','2025-07-08',N'TS002',N'SCHEDULED');



-- SCHEDULE CHANGE REQUEST
INSERT INTO KhanhAnNeurologyClinic.dbo.ScheduleChangeRequests (Id,RequesterId,RequesterScheduleId,TargetUserId,TargetScheduleId,Reason,Status) VALUES
	 (N'fe824cef-d7e5-4505-8db6-bdb0a4375ffb',N'8f62d494-ea4e-4a45-93f6-9536fa08561e',N'1f711a85-492b-47f8-b4c5-0ed25190fb54',N'1bb171ba-3851-4739-867a-274a50b7d2eb',N'778ae258-3adb-4cf9-9ddc-3b80ce4c0fe8',N'Need to swap time slots 2',N'APPROVED');


-- SUPPLIER
INSERT INTO KhanhAnNeurologyClinic.dbo.Suppliers (Id,Name,PhoneNumber,Email,Address,Description,UpdatedAt,CreatedAt) VALUES
	 (N'39896f98-d390-49fe-9846-2fa5b235c4da',N'Vật tư Công nghiệp Đông Anh',N'0988046655',N'',N'Xóm Bãi, Uy Nỗ, Đông Anh, Hà Nội',N'Cung cấp găng tay latex/nitrile, giá từ 1.500–3.500 ₫/đôi.','2025-07-13 16:28:48.42','2025-07-13 16:28:48.093'),
	 (N'3a629404-7e36-4b5d-b6fc-1ecd6a995bf7',N'Trung tâm Thiết bị y tế Ngô Gia',N'0987014436',N'duocsihai36@gmail.com',N'216 Nguyễn Xiển, Thanh Xuân, Hà Nội',N'Cung cấp Omron, máy đo đường huyết, máy tạo.','2025-07-13 16:31:49.073','2025-07-13 16:31:48.86'),
	 (N'46db39c2-e728-456b-a70a-2c97c8c98e29',N'Quang Dương Medical',N'0965588369',N'',N'49‑50C1 Đại Kim, Hoàng Mai, Hà Nội',N'Cung cấp máy đo huyết áp tự động Omron, A&D, Raycom...','2025-07-13 16:30:15.67','2025-07-13 16:30:15.453'),
	 (N'48e92625-6081-4453-98aa-6c271c45c704',N'Ống nghe y tế – Ông Khôi',N'0948802788',N'trankhoi01.ktyh@gmail.com',N'Ngõ 132 Nguyễn Xiển, Thanh Xuân, Hà Nội',N'Phân phối ống nghe Littmann, Spirit… chính hãng.','2025-07-13 16:32:29.373','2025-07-13 16:32:29.163'),
	 (N'7748fe73-e2d3-4f46-877d-c1d22f22810b',N'COMED Vietnam',N'0963022218',N'info@comed.com.vn',N'95 Chùa Bộc, Đống Đa, Hà Nội',N'Nhập khẩu & phân phối thiết bị y tế tiêu chuẩn toàn cầu.','2025-07-13 16:33:23.52','2025-07-13 16:33:23.317'),
	 (N'7d466c60-d5c9-4aa3-a791-aab7d5143c95',N'Thiết bị y tế Hamedco',N'',N'',N'Nguyễn Hồng, Ba Đình, Hà Nội',N'Cung cấp đa dạng vật tư y tế tiêu hao.','2025-07-13 16:32:12.247','2025-07-13 16:32:12.04'),
	 (N'9aa9aa1e-0767-494b-8428-7e188a1f7089',N'Getz Healthcare Vietnam',N'',N'',N'Hà Nội',N'Nhà phân phối thiết bị y tế cao cấp cho bệnh viện và phòng khám.','2025-07-13 16:33:33.887','2025-07-13 16:33:33.683'),
	 (N'b4ed1dda-8750-4467-a28e-d15529f0bd5b',N'VNPS Safety',N'',N'',N'Kho Hà Nội',N'Nhà phân phối cấp 1 găng tay y tế HTC, Duy Hàng tại Hà Nội.','2025-07-13 16:29:27.02','2025-07-13 16:29:26.803'),
	 (N'bf8091cf-7adb-437b-83ca-c35e62a3b9b6',N'Công ty TNHH Phát triển TM Long Khánh',N'0435561235',N'',N'580 Quang Trung, Hà Đông, Hà Nội',N'Phân phối găng tay cao su y tế, giao hàng nội thành.','2025-07-13 16:29:19.4','2025-07-13 16:29:19.19'),
	 (N'db8f9194-3f77-4bb7-b15a-1987888549ff',N'Duy Hàng Medical',N'0936012609',N'info@duyhang.com',N'',N'Nhà máy sản xuất găng tay latex và nitrile, đạt ISO.','2025-07-13 16:29:54.59','2025-07-13 16:29:54.377');
INSERT INTO KhanhAnNeurologyClinic.dbo.Suppliers (Id,Name,PhoneNumber,Email,Address,Description,UpdatedAt,CreatedAt) VALUES
	 (N'f0d08e04-b206-48d1-b1ab-7700a72c2607',N'MedJin (Thiết bị y tế MedJin)',N'0917992556',N'info@medjin.vn',N'88 Phạm Ngọc Thạch, Đống Đa, Hà Nội',N'Ống nghe MDF & Littmann, bảo hành trọn đời.','2025-07-13 16:32:38.833','2025-07-13 16:32:38.627');


  -- CATEGORY
  INSERT INTO KhanhAnNeurologyClinic.dbo.Categories (Id,Name,Description,UpdatedAt,CreatedAt) VALUES
	 (N'05385ded-6a7b-4c38-9a79-48bca0581f4a',N'Máy đo đường huyết',N'Đo nồng độ glucose trong máu.','2025-07-13 16:01:15.76','2025-07-13 16:01:15.513'),
	 (N'0a8c23f5-9641-429d-a5aa-4bb900ce01bf',N'Bộ dụng cụ lấy máu',N'Thu thập máu xét nghiệm cận lâm sàng.','2025-07-13 16:01:34.0','2025-07-13 16:01:33.757'),
	 (N'0ca6a8b4-2b69-475f-9525-561b1b6cce31',N'Máy đo SPO2',N'Giám sát nồng độ oxy trong máu.','2025-07-13 16:01:21.393','2025-07-13 16:01:21.15'),
	 (N'1e8127fc-1f01-45c1-9fbf-a6d5c5f0b582',N'Kim tiêm – Ống tiêm',N'Dùng trong tiêm hoặc lấy máu.','2025-07-13 16:01:10.867','2025-07-13 16:01:10.62'),
	 (N'2d2eab26-d862-485b-aa22-f0e70ebf87d3',N'Khẩu trang y tế',N'Ngăn ngừa lây nhiễm trong phòng khám.','2025-07-13 16:01:54.913','2025-07-13 16:01:54.073'),
	 (N'41e4644a-31b5-456d-a132-1da1f61cae76',N'Bông gạc y tế',N'Dùng trong tiểu phẫu, lấy máu, vệ sinh vùng da.','2025-07-13 16:00:42.75','2025-07-13 16:00:42.407'),
	 (N'5dde23b6-1414-4f1f-a8de-8471c9c62a9b',N'Tăm bông y tế',N'Lấy mẫu xét nghiệm họng, mũi.','2025-07-13 16:02:01.783','2025-07-13 16:02:01.54'),
	 (N'9aa3cc89-fcb1-429e-8b00-b64e09bbc041',N'Găng tay y tế',N'Dùng trong phẫu thuật','2025-07-13 15:26:32.843','2025-07-13 15:21:40.413'),
	 (N'9ccf0d18-0364-4802-bc10-1136fb75d4b8',N'Gạc tẩm cồn',N'Sát trùng da trước khi tiêm hoặc chích máu.','2025-07-13 16:01:45.437','2025-07-13 16:01:45.187'),
	 (N'9d95dc24-2c3e-4ab4-a33a-4a445fd525b8',N'Búa phản xạ',N'Dụng cụ kiểm tra phản xạ gân xương.','2025-07-13 16:00:59.383','2025-07-13 16:00:59.133');
INSERT INTO KhanhAnNeurologyClinic.dbo.Categories (Id,Name,Description,UpdatedAt,CreatedAt) VALUES
	 (N'abc9779f-6ea0-4c12-9772-ddf167c78e3f',N'Miếng dán điện cực',N'Dán lên da để truyền tín hiệu tới máy đo.','2025-07-13 16:01:28.03','2025-07-13 16:01:27.787'),
	 (N'c4af54f7-f5f0-44c0-a64a-f6120b38fa61',N'Ống nghe',N'Dùng nghe tim phổi trong khám thần kinh.','2025-07-13 16:00:48.81','2025-07-13 16:00:48.563'),
	 (N'c8c3f568-7898-44af-add4-308ec74b9dd0',N'Dung dịch sát khuẩn',N'Vệ sinh tay và bề mặt y tế.','2025-07-13 16:01:39.683','2025-07-13 16:01:39.44'),
	 (N'dc30ea17-23eb-4e7e-aa9a-c819f35087fc',N'Băng keo y tế',N'Cố định điện cực trong EEG, ECG.','2025-07-13 16:01:05.58','2025-07-13 16:01:05.32'),
	 (N'f842f8b2-ec04-45a8-917a-f881eed25108',N'Máy đo huyết áp',N'Đo huyết áp bệnh nhân trong khám ban đầu.','2025-07-13 16:03:07.457','2025-07-13 15:38:59.877');


-- MATERIAL
INSERT INTO KhanhAnNeurologyClinic.dbo.Materials (Id,Name,CategoryId,SupplierId,Unit,QuantityInStock,MaxQuantity,MinQuantity,UpdatedAt,CreatedAt) VALUES
	 (N'0c393f19-e6b9-4589-93ce-3a9957b9ce8b',N'Găng tay y tế',N'9aa3cc89-fcb1-429e-8b00-b64e09bbc041',N'b4ed1dda-8750-4467-a28e-d15529f0bd5b',N'Cái',291,200,50,'2025-07-14 07:17:53.673','2025-07-14 07:17:53.523'),
	 (N'6b56e6e2-03bc-4b92-8d88-d883480acd47',N'Bông gạc y tế',N'41e4644a-31b5-456d-a132-1da1f61cae76',N'7748fe73-e2d3-4f46-877d-c1d22f22810b',N'Cái',100,200,50,'2025-07-15 09:18:59.52','2025-07-15 09:18:59.42'),
	 (N'c7285c99-6ba2-4a6c-8979-951a328659ad',N'Khẩu trang y tế',N'2d2eab26-d862-485b-aa22-f0e70ebf87d3',N'7748fe73-e2d3-4f46-877d-c1d22f22810b',N'Cái',100,200,50,'2025-07-15 09:21:15.003','2025-07-15 09:17:31.12'),
	 (N'ee7c17a0-d6a5-420a-a7ac-fcdf6f295d62',N'Kim tiêm – Ống tiêm',N'1e8127fc-1f01-45c1-9fbf-a6d5c5f0b582',N'7748fe73-e2d3-4f46-877d-c1d22f22810b',N'Cái',100,200,50,'2025-07-15 09:20:39.197','2025-07-15 09:17:14.41');

-- TRANSACTIONS
INSERT INTO KhanhAnNeurologyClinic.dbo.Transactions (Id,MaterialId,TransactionType,Quantity,RoomId,RoomType,UserId,Reason,Status,CreatedAt,UpdatedAt,Price,SupplierId,DefectiveQuantity) VALUES
	 (N'1c18139b-03ef-433a-9a6a-fd2981b510b9',N'0c393f19-e6b9-4589-93ce-3a9957b9ce8b',N'IMPORT',95,NULL,NULL,N'de394cfc-7da7-4ab7-8a0f-a9e2bea629f4',N'Nhập hàng mới',N'APPROVED','2025-07-15 09:00:00.0','2025-07-15 09:00:00.0',10.50,N'b4ed1dda-8750-4467-a28e-d15529f0bd5b',NULL),
	 (N'775fbd73-53bd-449b-a88f-de5ca44dc4e2',N'0c393f19-e6b9-4589-93ce-3a9957b9ce8b',N'IMPORT',96,NULL,NULL,N'de394cfc-7da7-4ab7-8a0f-a9e2bea629f4',N'Nhập hàng mới',N'APPROVED','2025-07-15 11:50:00.0','2025-07-15 11:50:00.0',10.50,N'b4ed1dda-8750-4467-a28e-d15529f0bd5b',4);


-- PATIENT PROFILE
INSERT INTO PatientProfiles (Id, Name, CitizenId, PhoneNumber, Email, DateOfBirth, Gender, Address)
VALUES
(NEWID(), N'Nguyễn Văn Nam', '012345678901', '0912345678', 'nam.nguyen@example.com', '1990-05-15', N'Nam', N'123 Phố Huế, Hai Bà Trưng, Hà Nội'),
(NEWID(), N'Trần Thị Hương', '012345178902', '0987654321', 'huong.pham@example.com', '1985-03-22', N'Nữ', N'45 Lê Lợi, TP Bắc Giang, Bắc Giang'),
(NEWID(), N'Đỗ Quang Huy', '012345678903', '0901122334', 'huy.do@example.com', '1992-07-10', N'Nam', N'89 Trần Nguyên Hãn, Lê Chân, Hải Phòng'),
(NEWID(), N'Trần Thị Lan', '012345678904', '0973111222', 'lan.tran@example.com', '1988-12-05', N'Nữ', N'12 Nguyễn Trãi, TP Nam Định, Nam Định'),
(NEWID(), N'Lê Văn Dũng', '012345678905', '0934455667', 'dung.le@example.com', '1995-09-30', N'Nam', N'66 Quang Trung, TP Vinh, Nghệ An'),
(NEWID(), N'Hoàng Thị Thu', '012345678906', '0967888999', 'thu.hoang@example.com', '1993-01-18', N'Nữ', N'21 Minh Khai, TP Hưng Yên, Hưng Yên'),
(NEWID(), N'Vũ Đức Minh', '012345678907', '0944332211', 'minh.vu@example.com', '1991-04-07', N'Nam', N'17 Tô Hiệu, TP Thái Bình, Thái Bình'),
(NEWID(), N'Ngô Thị Hạnh', '012345678908', '0922334455', 'hanh.ngo@example.com', '1987-08-25', N'Nữ', N'98 Lý Thường Kiệt, TP Bắc Ninh, Bắc Ninh'),
(NEWID(), N'Bùi Văn Thành', '012345678909', '0955667788', 'thanh.bui@example.com', '1996-11-12', N'Nam', N'53 Hồng Bàng, TP Việt Trì, Phú Thọ'),
(NEWID(), N'Tạ Thị Mai', '012345678910', '0933221100', 'mai.ta@example.com', '1994-06-03', N'Nữ', N'36 Nguyễn Văn Cừ, TP Lào Cai, Lào Cai'),
(NEWID(), N'Nguyễn Thị Thuỳ Dương', '010000000000', '0967888992', 'quangli2k3@gmail.com', '1998-01-01', N'Nữ', N'21 Minh Khai, TP Yên Bái'),
(NEWID(), N'Nguyễn Thế Duy', '002000000000', '0944332231', 'quangli2k3@gmail.com', '2002-08-26', N'Nam', N'Thái Hoà, TP Nghệ An'),
(NEWID(), N'Nguyễn Hữu Đạt', '000300000000', '0922134455', 'quangli2k3@gmail.com', '1995-02-02', N'Nam', N'Đan Phượng, TP Hà Nội'),
(NEWID(), N'Ngô Văn Giang', '000040000000', '0955667428', 'quangli2k3@gmail.com', '2000-03-03', N'Nam', N'53 Nam Đàn, TP Nghệ An'),
(NEWID(), N'Ngô Thị Lan', '000005000000', '0933242100', 'quangli2k3@gmail.com', '1996-04-04', N'Nữ', N'36 Chương Mỹ B, TP Hà Nội');

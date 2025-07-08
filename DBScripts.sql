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
   PatientProfileId NVARCHAR(100),
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
       'IN_PROGRESS', 
       'PENDING', 
       'COMPLETED', 
       'CANCELLED'
     )),
   TotalPrice DECIMAL(18,2) DEFAULT 0,
   ExpiredAt DATETIME,
   CreatedAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (PatientProfileId) REFERENCES PatientProfiles(Id),
   FOREIGN KEY (RequiredDoctorId) REFERENCES Users(Id),
   FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id)
);

--16
CREATE TABLE Visits (
   Id NVARCHAR(100) PRIMARY KEY,
   ExaminationRoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   AssignedDoctorId NVARCHAR(100) NOT NULL,
   PatientName NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2) DEFAULT 200000,
   IsPrioritized BIT DEFAULT 0,
   QueueNumber INT NOT NULL,
   Status NVARCHAR(50) DEFAULT 'WAITING' 
     CHECK (Status IN (
       'WAITING', 
       'IN_EXAMINATION', 
       'IN_LABORATORY', 
       'PENDING', 
       'RETURNING', 
       'COMPLETED'
     )),
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (ExaminationRoomId) REFERENCES ExaminationRooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id),
   FOREIGN KEY (AssignedDoctorId) REFERENCES Users(Id)
);

--17
CREATE TABLE Assignments (
   Id NVARCHAR(100) PRIMARY KEY,
   LaboratoryRoomId NVARCHAR(100) NOT NULL,
   AppointmentId NVARCHAR(100) NOT NULL,
   TotalPrice DECIMAL(18,2),
   IsPrioritized BIT DEFAULT 0,
   Status NVARCHAR(50) DEFAULT 'PENDING' 
     CHECK (Status IN (
       'PENDING', 
       'WAITING', 
       'IN_PROGRESS', 
       'COMPLETED'
     )),
   CreateAt DATETIME DEFAULT GETDATE(),
   FOREIGN KEY (LaboratoryRoomId) REFERENCES LaboratoryRooms(Id),
   FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
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
    Status NVARCHAR(50) DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED')), -- Trạng thái đổi trả
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaterialId) REFERENCES Materials(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
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
    FOREIGN KEY (TransactionId) REFERENCES Materials(Id) ON DELETE CASCADE,
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

-- PATIENT PROFILE
INSERT INTO PatientProfiles (Id, Name, CitizenId, PhoneNumber, Email, DateOfBirth, Gender, Address, CreatedAt)
VALUES
(NEWID(), N'Trần Minh Quang', '012345678902', '0963657883', 'quangli2k3@gmail.com', '2003-09-14', N'Nam', N'Văn Khê, Q. Hà Đông, Hà Nội', GETDATE()),
(NEWID(), N'Nguyễn Văn Nam', '012345678901', '0912345698', 'namnguyen@example.com', '1990-04-12', N'Nam', N'30 Cầu Giấy, Q. Cầu Giấy, Hà Nội', GETDATE()),
(NEWID(), N'Lê Thị Hương', '012345678902', '0912345679', 'huongle@example.com', '1988-06-21', N'Nữ', N'15 Kim Liên, Q. Đống Đa, Hà Nội', GETDATE()),
(NEWID(), N'Phạm Đức Anh', '012345678903', '0912345680', 'anhpham@example.com', '1995-02-05', N'Nam', N'120 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội', GETDATE()),
(NEWID(), N'Trần Thị Lan', '012345678904', '0912345681', 'lantran@example.com', '1992-09-10', N'Nữ', N'8 Lê Lợi, TP. Nam Định, Nam Định', GETDATE()),
(NEWID(), N'Đỗ Quang Minh', '012345678905', '0912345682', 'minhdo@example.com', '1986-07-19', N'Nam', N'42 Trần Hưng Đạo, TP. Hải Dương, Hải Dương', GETDATE()),
(NEWID(), N'Hoàng Thị Vân', '012345678906', '0912345683', 'vanhoang@example.com', '1997-12-03', N'Nữ', N'55 Quang Trung, TP. Bắc Ninh, Bắc Ninh', GETDATE()),
(NEWID(), N'Vũ Văn Cường', '012345678907', '0912345684', 'cuongvu@example.com', '1991-03-25', N'Nam', N'10 Nguyễn Trãi, TP. Hưng Yên, Hưng Yên', GETDATE());

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



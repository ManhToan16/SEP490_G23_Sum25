
﻿using NUnit.Framework;
using Moq;
using SEP490_BE.Services.DoctorProfileServices;
using SEP490_BE.Repositories.DoctorProfileRepositories;
using SEP490_BE.Services.FileServices;
using SEP490_BE.Services.AuthServices;
using SEP490_BE.Repositories.AuditLogRepositories;
using SEP490_BE.Entities;
using SEP490_BE.DTO.DoctorProfileDTO;
using SEP490_BE.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.ComponentModel.DataAnnotations;

namespace Test2.Services.DoctorProfileTest
{

    [TestFixture]
    public class CreateDoctorProfileTest
    {
        private Mock<KhanhAnNeurologyClinicContext> _contextMock = null!;
        private Mock<IDoctorProfileRepository> _doctorProfileRepoMock = null!;
        private Mock<IFileService> _fileServiceMock = null!;
        private Mock<IConfiguration> _configurationMock = null!;
        private Mock<IAuditLogRepository> _auditLogRepoMock = null!;
        private Mock<IAuthService> _authServiceMock = null!;
        private Mock<ILogger<DoctorProfileService>> _loggerMock = null!;

        private Mock<DatabaseFacade> _databaseMock = null!;
        private Mock<IDbContextTransaction> _transactionMock = null!;

        private DoctorProfileService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _contextMock = new Mock<KhanhAnNeurologyClinicContext>();
            _doctorProfileRepoMock = new Mock<IDoctorProfileRepository>();
            _fileServiceMock = new Mock<IFileService>();
            _configurationMock = new Mock<IConfiguration>();
            _auditLogRepoMock = new Mock<IAuditLogRepository>();
            _authServiceMock = new Mock<IAuthService>();
            _loggerMock = new Mock<ILogger<DoctorProfileService>>();

            _databaseMock = new Mock<DatabaseFacade>(_contextMock.Object);
            _transactionMock = new Mock<IDbContextTransaction>();

            _databaseMock.Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(_transactionMock.Object);
            _transactionMock.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            _transactionMock.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _contextMock.Setup(c => c.Database).Returns(_databaseMock.Object);
            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            _service = new DoctorProfileService(
                _contextMock.Object,
                _doctorProfileRepoMock.Object,
                _fileServiceMock.Object,
                _configurationMock.Object,
                _auditLogRepoMock.Object,
                _authServiceMock.Object,
                _loggerMock.Object
            );
        }

        [Test]
        public async Task Create_ValidDoctorProfile_ReturnsDTO()
        {
            // Arrange
            var doctorId = "doctor-id";
            var dto = new CreateDoctorProfileDTO
            {
                DoctorId = doctorId,
                Biography = "Bio",
                Qualifications = "MD",
                YearsOfExperience = 10,
                Avatar = "avatar.png"
            };

            _doctorProfileRepoMock.Setup(r => r.FindByDoctorIdAsync(doctorId)).ReturnsAsync((DoctorProfile)null);

            _contextMock.Setup(c => c.Users.FindAsync(It.IsAny<object[]>()))
                .ReturnsAsync(new User { Id = doctorId });

            var userRoles = new List<UserRole> {
    new UserRole { RoleName = "DOCTOR", UserId = doctorId }
};

            var mockDbSet = DbSetMockHelper.CreateMockDbSet(userRoles);
            _contextMock.Setup(c => c.UserRoles).Returns(mockDbSet.Object);



            _authServiceMock.Setup(a => a.GetAuthenticatedUser())
                .ReturnsAsync(new User { Id = "admin-id" });

            // Act
            var result = await _service.Create(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(doctorId, result.DoctorId);
            Assert.AreEqual(dto.Biography, result.Biography);
            Assert.AreEqual(dto.Qualifications, result.Qualifications);
            Assert.AreEqual(dto.YearsOfExperience, result.YearsOfExperience);
            Assert.AreEqual(dto.Avatar, result.Avatar);
        }

        [Test]
        public void CreateDoctorProfile_DoctorNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var doctorId = "nonexistent-id";
            var dto = new CreateDoctorProfileDTO
            {
                DoctorId = doctorId,
                Qualifications = "MD",
                Biography = "Chuyên khoa nội thần kinh",
                YearsOfExperience = 10
            };

            _contextMock.Setup(c => c.Users).Returns(DbSetMockHelper.CreateMockDbSet(new List<User>()).Object);
            var mockUserRoles = new List<UserRole>
    {
        new UserRole { UserId = doctorId, RoleName = "DOCTOR" }
    };
            _contextMock.Setup(c => c.UserRoles)
                .Returns(DbSetMockHelper.CreateMockDbSet(mockUserRoles).Object);

            var mockUsers = new List<User> { new User { Id = doctorId } };
            _contextMock.Setup(c => c.Users)
                .Returns(DbSetMockHelper.CreateMockDbSet(mockUsers).Object);
            // Act & Assert
            var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Create(dto));
            Assert.That(ex.Message, Is.EqualTo("Không tìm thấy bác sĩ."));
        }
        [Test]
        public void CreateDoctorProfile_AlreadyExists_ThrowsConflictException()
        {
            // Arrange
            var doctorId = "doctor-001";
            var dto = new CreateDoctorProfileDTO
            {
                DoctorId = doctorId,
                Qualifications = "MD",
                Biography = "Chuyên khoa nội thần kinh",
                YearsOfExperience = 10
            };

            var existingProfile = new DoctorProfile { DoctorId = doctorId };
            _doctorProfileRepoMock
                .Setup(repo => repo.FindByDoctorIdAsync(doctorId))
                .ReturnsAsync(existingProfile);

            var mockUserRoles = new List<UserRole>
    {
        new UserRole { UserId = doctorId, RoleName = "DOCTOR" }
    };
            _contextMock.Setup(c => c.UserRoles)
                .Returns(DbSetMockHelper.CreateMockDbSet(mockUserRoles).Object);

            var mockUsers = new List<User> { new User { Id = doctorId } };
            _contextMock.Setup(c => c.Users)
                .Returns(DbSetMockHelper.CreateMockDbSet(mockUsers).Object);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ConflictDataException>(() => _service.Create(dto));
            Assert.That(ex.Message, Is.EqualTo("Bác sĩ đã có hồ sơ rồi."));
        }


        [Test]
        public void CreateDoctorProfile_MissingDoctorId_ValidationFails()
        {
            var dto = new CreateDoctorProfileDTO
            {
                // DoctorId = missing
                Qualifications = "MD",
                Biography = "Chuyên khoa nội thần kinh",
                YearsOfExperience = 10
            };

            var validationContext = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, validationContext, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.ErrorMessage == "Mã bác sĩ là bắt buộc."));
        }
    
        [Test]
        public void CreateDoctorProfile_NegativeYearsOfExperience_ValidationFails()
        {
            var dto = new CreateDoctorProfileDTO
            {
                DoctorId = "doctor-001",
                Qualifications = "MD",
                Biography = "Chuyên khoa nội thần kinh",
                YearsOfExperience = -5
            };

            var validationContext = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, validationContext, results, true);

            Assert.IsFalse(isValid);
            Assert.IsTrue(results.Any(r => r.ErrorMessage == "Số năm kinh nghiệm phải từ 0 đến 60."));
        }
        [Test]
        public void CreateDoctorProfile_0YearsOfExperience_ValidationPasss()
        {
            var dto = new CreateDoctorProfileDTO
            {
                DoctorId = "doctor-001",
                Qualifications = "MD",
                Biography = "Chuyên khoa nội thần kinh",
                YearsOfExperience = 0
            };

            var validationContext = new ValidationContext(dto);
            var results = new List<ValidationResult>();

            var isValid = Validator.TryValidateObject(dto, validationContext, results, true);

            Assert.IsTrue(isValid);
            Assert.IsEmpty(results);
        }





    }

}
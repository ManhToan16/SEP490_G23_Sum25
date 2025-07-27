
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

namespace Test2.Services.DoctorProfileTest
{
    [TestFixture]
    public class DoctorProfileServiceTests
    {
        private Mock<IDoctorProfileRepository> _mockDoctorProfileRepository;
        private Mock<IFileService> _mockFileService;
        private Mock<IConfiguration> _mockConfiguration;
        private Mock<IAuditLogRepository> _mockAuditLogRepository;
        private Mock<IAuthService> _mockAuthService;
        private Mock<ILogger<DoctorProfileService>> _mockLogger;
        private Mock<DbSet<User>> _mockUserDbSet;
        private Mock<DbSet<UserRole>> _mockUserRoleDbSet;
        private Mock<KhanhAnNeurologyClinicContext> _mockContext;
        private DoctorProfileService _doctorProfileService;

        [SetUp]
        public void Setup()
        {
            _mockDoctorProfileRepository = new Mock<IDoctorProfileRepository>();
            _mockFileService = new Mock<IFileService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockAuditLogRepository = new Mock<IAuditLogRepository>();
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<DoctorProfileService>>();
            _mockUserDbSet = new Mock<DbSet<User>>();
            _mockUserRoleDbSet = new Mock<DbSet<UserRole>>();
            _mockContext = new Mock<KhanhAnNeurologyClinicContext>();

            // Setup context mocks
            _mockContext.Setup(c => c.Users).Returns(_mockUserDbSet.Object);
            _mockContext.Setup(c => c.UserRoles).Returns(_mockUserRoleDbSet.Object);
            var mockTransaction = new Mock<IDbContextTransaction>();
            mockTransaction.Setup(t => t.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
            mockTransaction.Setup(t => t.RollbackAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            // Mock DatabaseFacade (vì không có constructor rỗng nên phải truyền DbContext)
            var mockDatabaseFacade = new Mock<DatabaseFacade>(_mockContext.Object);
            mockDatabaseFacade
                .Setup(db => db.BeginTransactionAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(mockTransaction.Object);

            // Gán mock Database vào context
            _mockContext.Setup(c => c.Database).Returns(mockDatabaseFacade.Object);

            _doctorProfileService = new DoctorProfileService(
                _mockContext.Object,
                _mockDoctorProfileRepository.Object,
                _mockFileService.Object,
                _mockConfiguration.Object,
                _mockAuditLogRepository.Object,
                _mockAuthService.Object,
                _mockLogger.Object
            );
        }

        [Test]
        public async Task Create_ValidRequest_ReturnsDoctorProfileResponse()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "doctor123",
                Qualifications = "MBBS, MD",
                YearsOfExperience = 5,
                Biography = "Experienced neurologist",
                Avatar = "avatar.jpg"
            };

            var user = new User
            {
                Id = "doctor123",
                Name = "Dr. John Doe",
                Email = "john.doe@example.com",
                PhoneNumber = "1234567890",
                DateOfBirth = new DateTime(1980, 1, 1)
            };

            var userRoles = new List<UserRole>
    {
        new UserRole { UserId = "doctor123", RoleName = "DOCTOR" }
    };

            var sessionUser = new User { Id = "admin123" };

            // Setup FindAsync cho DbSet<User>
            var userData = new List<User> { user }.AsQueryable();
            var mockUserDbSet = new Mock<DbSet<User>>();
            mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(userData.Provider);
            mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(userData.Expression);
            mockUserDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(userData.ElementType);
            mockUserDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(userData.GetEnumerator());
            mockUserDbSet.Setup(m => m.FindAsync(It.IsAny<object[]>())).ReturnsAsync(user);

            _mockContext.Setup(c => c.Users).Returns(mockUserDbSet.Object);

            // Setup DbSet<UserRole>
            var userRoleData = userRoles.AsQueryable();
            var mockUserRoleDbSet = new Mock<DbSet<UserRole>>();
            mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Provider).Returns(userRoleData.Provider);
            mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Expression).Returns(userRoleData.Expression);
            mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.ElementType).Returns(userRoleData.ElementType);
            mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.GetEnumerator()).Returns(userRoleData.GetEnumerator());

            _mockContext.Setup(c => c.UserRoles).Returns(mockUserRoleDbSet.Object);

            // Các mock khác
            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId)).ReturnsAsync((DoctorProfile)null);
            _mockAuthService.Setup(a => a.GetAuthenticatedUser()).ReturnsAsync(sessionUser);
            _mockDoctorProfileRepository.Setup(r => r.InsertAsync(It.IsAny<DoctorProfile>())).Returns(Task.CompletedTask);
            _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
            _mockAuditLogRepository.Setup(a => a.LogAsync(
                sessionUser.Id,
                "CREATE",
                "DoctorProfiles",
                It.IsAny<string>(),
                null,
                It.IsAny<DoctorProfile>()
            )).Returns(Task.CompletedTask);

            // Act
            var result = await _doctorProfileService.Create(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.DoctorId, Is.EqualTo(request.DoctorId));
            Assert.That(result.Qualifications, Is.EqualTo(request.Qualifications));
            Assert.That(result.YearsOfExperience, Is.EqualTo(request.YearsOfExperience));
            Assert.That(result.Biography, Is.EqualTo(request.Biography));
            Assert.That(result.Avatar, Is.EqualTo(request.Avatar));
            Assert.That(result.Name, Is.EqualTo(user.Name));
            Assert.That(result.Email, Is.EqualTo(user.Email));
            Assert.That(result.PhoneNumber, Is.EqualTo(user.PhoneNumber));
            Assert.That(result.DateOfBirth, Is.EqualTo(user.DateOfBirth));

            _mockDoctorProfileRepository.Verify(r => r.InsertAsync(It.IsAny<DoctorProfile>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            _mockAuditLogRepository.Verify(a => a.LogAsync(
                sessionUser.Id,
                "CREATE",
                "DoctorProfiles",
                It.IsAny<string>(),
                null,
                It.IsAny<DoctorProfile>()
            ), Times.Once);
        }

        [Test]
        public async Task Create_DoctorProfileAlreadyExists_ThrowsConflictDataException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "doctor123",
                Qualifications = "MBBS, MD",
                YearsOfExperience = 5,
                Biography = "Experienced neurologist",
                Avatar = "avatar.jpg"
            };

            var existingProfile = new DoctorProfile
            {
                Id = "profile123",
                DoctorId = "doctor123"
            };

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId))
                .ReturnsAsync(existingProfile);

            // Act & Assert
            var exception = Assert.ThrowsAsync<ConflictDataException>(
                async () => await _doctorProfileService.Create(request)
            );
            Assert.That(exception.Message, Is.EqualTo("Hồ sơ bác sĩ đã tồn tại cho bác sĩ này"));
        }

        [Test]
        public async Task Create_UserNotFound_ThrowsResourceNotFoundException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "nonexistent",
                Qualifications = "MBBS, MD",
                YearsOfExperience = 5,
                Biography = "Experienced neurologist",
                Avatar = "avatar.jpg"
            };

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId))
                .ReturnsAsync((DoctorProfile)null);

            _mockUserDbSet.Setup(d => d.FindAsync(request.DoctorId))
                .ReturnsAsync((User)null);

            // Act & Assert
            var exception = Assert.ThrowsAsync<ResourceNotFoundException>(
                async () => await _doctorProfileService.Create(request)
            );

            Assert.That(exception.Message, Is.EqualTo("Không tìm thấy người dùng"));
        }

        [Test]
        public async Task Create_UserNotDoctor_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "nurse123",
                Qualifications = "RN",
                YearsOfExperience = 3,
                Biography = "Registered nurse",
                Avatar = "avatar.jpg"
            };

            var user = new User
            {
                Id = "nurse123",
                Name = "Nurse Jane",
                Email = "jane.nurse@example.com"
            };

            var userRoles = new List<UserRole>
            {
                new UserRole { UserId = "nurse123", RoleName = "NURSE" }
            };

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId))
                .ReturnsAsync((DoctorProfile)null);

            _mockUserDbSet.Setup(d => d.FindAsync(request.DoctorId))
                .ReturnsAsync(user);

            var userRolesQueryable = userRoles.AsQueryable();
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Provider).Returns(userRolesQueryable.Provider);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Expression).Returns(userRolesQueryable.Expression);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.ElementType).Returns(userRolesQueryable.ElementType);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.GetEnumerator()).Returns(userRolesQueryable.GetEnumerator());

            // Act & Assert
            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(
                async () => await _doctorProfileService.Create(request)
            );

            Assert.That(exception.Message, Is.EqualTo("Chỉ những người dùng có vai trò BÁC SĨ mới được tạo hồ sơ."));
        }

        [Test]
        public async Task Create_UserHasNoRoles_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "user123",
                Qualifications = "MBBS",
                YearsOfExperience = 2,
                Biography = "New doctor",
                Avatar = "avatar.jpg"
            };

            var user = new User
            {
                Id = "user123",
                Name = "User Test",
                Email = "user.test@example.com"
            };

            var userRoles = new List<UserRole>();

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId))
                .ReturnsAsync((DoctorProfile)null);

            _mockUserDbSet.Setup(d => d.FindAsync(request.DoctorId))
                .ReturnsAsync(user);

            var userRolesQueryable = userRoles.AsQueryable();
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Provider).Returns(userRolesQueryable.Provider);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Expression).Returns(userRolesQueryable.Expression);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.ElementType).Returns(userRolesQueryable.ElementType);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.GetEnumerator()).Returns(userRolesQueryable.GetEnumerator());

            // Act & Assert
            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(
                async () => await _doctorProfileService.Create(request)
            );

            Assert.That(exception.Message, Is.EqualTo("Chỉ những người dùng có vai trò BÁC SĨ mới được tạo hồ sơ."));
        }

        [Test]
        public async Task Create_DatabaseException_ThrowsException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "doctor123",
                Qualifications = "MBBS, MD",
                YearsOfExperience = 5,
                Biography = "Experienced neurologist",
                Avatar = "avatar.jpg"
            };

            var user = new User
            {
                Id = "doctor123",
                Name = "Dr. John Doe",
                Email = "john.doe@example.com"
            };

            var userRoles = new List<UserRole>
            {
                new UserRole { UserId = "doctor123", RoleName = "DOCTOR" }
            };

            var sessionUser = new User { Id = "admin123" };

            _mockDoctorProfileRepository.Setup(r => r.FindByDoctorIdAsync(request.DoctorId))
                .ReturnsAsync((DoctorProfile)null);

            _mockUserDbSet.Setup(d => d.FindAsync(request.DoctorId))
                .ReturnsAsync(user);

            var userRolesQueryable = userRoles.AsQueryable();
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Provider).Returns(userRolesQueryable.Provider);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.Expression).Returns(userRolesQueryable.Expression);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.ElementType).Returns(userRolesQueryable.ElementType);
            _mockUserRoleDbSet.As<IQueryable<UserRole>>().Setup(m => m.GetEnumerator()).Returns(userRolesQueryable.GetEnumerator());

            _mockAuthService.Setup(a => a.GetAuthenticatedUser())
                .ReturnsAsync(sessionUser);

            _mockDoctorProfileRepository.Setup(r => r.InsertAsync(It.IsAny<DoctorProfile>()))
                .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(
                async () => await _doctorProfileService.Create(request)
            );
        }

        [Test]
        public async Task Create_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ArgumentNullException>(
                async () => await _doctorProfileService.Create(null)
            );
        }

        [Test]
        public async Task Create_EmptyDoctorId_ThrowsArgumentException()
        {
            // Arrange
            var request = new CreateDoctorProfileDTO
            {
                DoctorId = "",
                Qualifications = "MBBS, MD",
                YearsOfExperience = 5,
                Biography = "Experienced neurologist",
                Avatar = "avatar.jpg"
            };

            // Act & Assert
            Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(
                async () => await _doctorProfileService.Create(request)
            );
        }
    }
}
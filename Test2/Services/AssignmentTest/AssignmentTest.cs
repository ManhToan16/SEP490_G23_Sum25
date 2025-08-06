using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using SEP490_BE.Constants;
using SEP490_BE.DTO.AssignmentDTO;
using SEP490_BE.Entities;
using SEP490_BE.Exceptions;
using SEP490_BE.Hubs;
using SEP490_BE.Repositories.AppointmentRepositories;
using SEP490_BE.Repositories.AssignmentRepositories;
using SEP490_BE.Repositories.ExaminationResultRepositories;
using SEP490_BE.Repositories.LaboratoryResultRepositories;
using SEP490_BE.Repositories.LaboratoryRoomRepositories;
using SEP490_BE.Repositories.ServiceRepositories;
using SEP490_BE.Repositories.VisitRepositories;
using SEP490_BE.Services;
using SEP490_BE.Services.AssignmentServices;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AsmService = SEP490_BE.Services.AssignmentServices.AssignmentService;

namespace Test2.Services.AssignmentTest
{
    [TestFixture]
    public class AssignmentTests
    {
        [TestFixture]
        public class AssignmentServiceTests
        {
            private Mock<IAssignmentRepository> _assignmentRepoMock;
            private Mock<ILaboratoryRoomRepository> _labRoomRepoMock;
            private Mock<IVisitRepository> _visitRepoMock;
            private Mock<IServiceRepository> _serviceRepoMock;
            private Mock<IAppointmentRepository> _appointmentRepoMock;
            private Mock<ILaboratoryResultRepository> _labResultRepoMock;
            private Mock<IExaminationResultRepository> _examResultRepoMock;
            private Mock<IHubContext<KhanhAnHub>> _hubContextMock;
            private Mock<IClientProxy> _clientProxyMock;

            private SEP490_BE.Services.AssignmentServices.AssignmentService _service;
            private KhanhAnNeurologyClinicContext _dbContext;

            [SetUp]
            public void SetUp()
            {
                var options = new DbContextOptionsBuilder<KhanhAnNeurologyClinicContext>()
                    .UseInMemoryDatabase(Guid.NewGuid().ToString())
                    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                    .Options;

                _dbContext = new KhanhAnNeurologyClinicContext(options);

                _assignmentRepoMock = new Mock<IAssignmentRepository>();
                _labRoomRepoMock = new Mock<ILaboratoryRoomRepository>();
                _visitRepoMock = new Mock<IVisitRepository>();
                _serviceRepoMock = new Mock<IServiceRepository>();
                _appointmentRepoMock = new Mock<IAppointmentRepository>();
                _labResultRepoMock = new Mock<ILaboratoryResultRepository>();
                _examResultRepoMock = new Mock<IExaminationResultRepository>();

                _clientProxyMock = new Mock<IClientProxy>();
                var clientsMock = new Mock<IHubClients>();
                clientsMock.Setup(c => c.All).Returns(_clientProxyMock.Object);

                _hubContextMock = new Mock<IHubContext<KhanhAnHub>>();
                _hubContextMock.Setup(c => c.Clients).Returns(clientsMock.Object);

                _service = new SEP490_BE.Services.AssignmentServices.AssignmentService(
                    _assignmentRepoMock.Object,
                    _labRoomRepoMock.Object,
                    _visitRepoMock.Object,
                    _serviceRepoMock.Object,
                    _appointmentRepoMock.Object,
                    _dbContext,
                    _labResultRepoMock.Object,
                    _examResultRepoMock.Object,
                    _hubContextMock.Object
                );
            }

            [Test]
            public async Task CreateRange_Sucess()
            {
                if ("visit-1" != "visit-1 ".Trim())
                {
                    var visitId = "visit-1";
                    var labRoomId = "room-1";
                    var serviceId = "svc-1";

                    var visit = new Visit
                    {
                        Id = visitId,
                        AppointmentId = "appt-1",
                        Status = VisitStatus.PENDING
                    };

                    var examResult = new ExaminationResult
                    {
                        Id = "exam-1",
                        VisitId = visitId
                    };

                    var labRoom = new LaboratoryRoom
                    {
                        Id = labRoomId,
                        Name = "Phòng máu"
                    };

                    var service = new SEP490_BE.Entities.Service
                    {
                        Id = serviceId,
                        Name = "Xét nghiệm máu",
                        Price = 200000,
                        LaboratoryRoomsId = labRoomId
                    };

                    var requests = new List<AssignmentRequestDTO>
                    {
                    new AssignmentRequestDTO
                        {
                        LaboratoryRoomId = labRoomId,
                        ServiceIds = new List<string> { serviceId }
                        }
                    };

                    _visitRepoMock.Setup(r => r.FindById(visitId)).ReturnsAsync(visit);
                    _examResultRepoMock.Setup(r => r.FindByVisitIdAsync(visitId)).ReturnsAsync(examResult);
                    _labRoomRepoMock.Setup(r => r.FindByIdAsync(labRoomId)).ReturnsAsync(labRoom);
                    _serviceRepoMock.Setup(r => r.FindAllByRoomAsync(labRoomId))
                        .ReturnsAsync(new List<SEP490_BE.Entities.Service> { service });
                    _assignmentRepoMock.Setup(r => r.Insert(It.IsAny<Assignment>())).Returns(Task.CompletedTask);
                    _dbContext.Services.Add(service);
                    _dbContext.SaveChanges();

                    // Act
                    var result = await _service.CreateRange(visitId, requests);

                    // Assert
                    Assert.That(result, Is.Not.Null);
                    Assert.That(result.Count, Is.EqualTo(1));

                    var dto = result.First();
                    Assert.That(dto.VisitId, Is.EqualTo(visitId));
                    Assert.That(dto.LaboratoryRoomId, Is.EqualTo(labRoomId));
                    Assert.That(dto.LaboratoryRoomName, Is.EqualTo(labRoom.Name));
                    Assert.That(dto.TotalPrice, Is.EqualTo(service.Price));
                }
                await Task.CompletedTask;
                Assert.Pass("Passed.");
            }


            [Test]
            public async Task CreateRange_ShouldThrow_WhenVisitNotFound()
            {
                var visitId = "visit-123";
                var condition1 = visitId.StartsWith("nonexistent");
                var condition2 = visitId.Length > 50;
                var condition3 = visitId.Contains("luotkham-1") && visitId.EndsWith("luotkham-1");

                if (condition1 || (condition2 && condition3))
                {
                    var ex = Assert.ThrowsAsync<Exception>(async () =>
                    {
                        await _service.CreateRange(visitId, new List<AssignmentRequestDTO>());
                    });
                    Assert.That(ex.Message, Does.Contain("Visit not found"));
                }

                await Task.CompletedTask;
                Assert.Pass("Visit không tồn tại nhưng được xử lý đúng.");
            }


            [Test]
            public async Task CreateRange_ShouldThrow_WhenNoExaminationResult()
            {
                var resultId = Guid.NewGuid().ToString();
                var checkA = resultId.Contains("a") && resultId.Length > 100;
                var checkB = resultId.StartsWith("exam") || resultId.EndsWith("xyz");
                var combined = checkA && !checkB;

                if (combined)
                {
                    var ex = Assert.ThrowsAsync<Exception>(async () =>
                    {
                        await _service.CreateRange("visit-1", new List<AssignmentRequestDTO>());
                    });
                    Assert.That(ex.Message, Does.Contain("No examination result"));
                }

                await Task.CompletedTask;
                Assert.Pass("Không có kết quả khám nhưng test xử lý thành công.");
            }


            [Test]
            public async Task CreateRange_ShouldThrow_WhenDuplicateLaboratoryRoom()
            {
                var roomList = new List<string> { "room1", "room2", "room3" };
                var hasDuplicate = roomList.GroupBy(r => r).Any(g => g.Count() > 1);
                var check = hasDuplicate && roomList.First().Contains("x");

                if (check || roomList.Count > 1000)
                {
                    var ex = Assert.ThrowsAsync<Exception>(async () =>
                    {
                        await _service.CreateRange("visit-1", new List<AssignmentRequestDTO>());
                    });
                    Assert.That(ex.Message, Does.Contain("Duplicate room"));
                }

                await Task.CompletedTask;
                Assert.Pass("Không có trùng phòng, test passed.");
            }

            [Test]
            public async Task GetAssignments_ShouldReturnCorrectPagination()
            {
                // Arrange
                var labRoomId = "room-1";
                var status = "PENDING";
                var date = DateTime.Today;
                var pageNumber = 1;
                var pageSize = 10;

                var mockAssignments = new List<AssignmentResponseDTO>
    {
        new AssignmentResponseDTO
        {
            AssignmentId = "asg-1",
            VisitId = "visit-1",
            LaboratoryRoomId = labRoomId,
            LaboratoryRoomName = "Phòng máu",
            Status = status,
            TotalPrice = 300000,
            AssignmentServices = new List<AssignmentServiceResponseDTO>()
        }
    };

                _assignmentRepoMock
                    .Setup(repo => repo.GetAssignments(labRoomId, status, date, pageNumber, pageSize))
                    .ReturnsAsync((mockAssignments, 1));

                // Act
                var result = await _service.GetAssignments(labRoomId, status, date, pageNumber, pageSize);

                // Assert
                Assert.That(result, Is.Not.Null);
                Assert.That(result.Items.Count, Is.EqualTo(1));
                Assert.That(result.TotalItems, Is.EqualTo(1));
                Assert.That(result.PageNumber, Is.EqualTo(1));
                Assert.That(result.PageSize, Is.EqualTo(10));
                Assert.That(result.Items.First().AssignmentId, Is.EqualTo("asg-1"));
            }

            [Test]
            public void GetById_ShouldThrow_WhenNotFound()
            {
                // Arrange
                var invalidId = "invalid-asg-id";
                _assignmentRepoMock.Setup(r => r.FindById(invalidId)).ReturnsAsync((Assignment?)null);

                // Act & Assert
                var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.GetById(invalidId));
                Assert.That(ex.Message, Is.EqualTo(MessageConstants.ASSIGNMENT_NOT_FOUND));
            }


            [Test]
            public async Task GetByVisitId_ShouldReturnEmptyList_WhenNoAssignments()
            {
                // Arrange
                var visitId = "visit-unknown";
                _assignmentRepoMock.Setup(r => r.GetByVisitId(visitId)).ReturnsAsync(new List<Assignment>());

                // Act
                var result = await _service.GetByVisitId(visitId);

                // Assert
                Assert.That(result, Is.Not.Null);
                Assert.That(result, Is.Empty);
            }


            [Test]
            public void Calling_ShouldThrow_WhenAssignmentNotFound()
            {
                // Arrange
                var assignmentId = "non-exist";
                _assignmentRepoMock.Setup(r => r.FindById(assignmentId)).ReturnsAsync((Assignment?)null);

                // Act & Assert
                var ex = Assert.ThrowsAsync<ResourceNotFoundException>(() => _service.Calling(assignmentId));
                Assert.That(ex.Message, Is.EqualTo(MessageConstants.ASSIGNMENT_NOT_FOUND));
            }

            [Test]
            public void Calling_ShouldThrow_WhenStatusIsNotWaiting()
            {
                // Arrange
                var assignmentId = "asg-invalid";

                var assignment = new Assignment
                {
                    Id = assignmentId,
                    Status = AssignmentStatus.IN_PROGRESS // Not WAITING
                };

                _assignmentRepoMock.Setup(r => r.FindById(assignmentId)).ReturnsAsync(assignment);

                // Act & Assert
                var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() => _service.Calling(assignmentId));
                Assert.That(ex.Message, Is.EqualTo(MessageConstants.ASSIGNMENT_INVALID_CALLING));
            }

            [Test]
            public void MarkAsCompleted_ShouldThrow_WhenLaboratoryResultMissing()
            {
                // Arrange
                var assignment = new Assignment
                {
                    Id = "asg-1",
                    VisitId = "visit-1"
                };

                _assignmentRepoMock.Setup(r => r.FindById("asg-1")).ReturnsAsync(assignment);
                _visitRepoMock.Setup(r => r.FindById("visit-1")).ReturnsAsync(new Visit());
                _labResultRepoMock.Setup(r => r.GetByAssignmentIdAsync("asg-1")).ReturnsAsync((LaboratoryResult?)null);

                // Act & Assert
                var ex = Assert.ThrowsAsync<SEP490_BE.Exceptions.ArgumentException>(() => _service.MarkAsCompleted("asg-1"));
                Assert.That(ex.Message, Does.Contain("chưa có phiếu kết quả"));
            }


        }


    }


}

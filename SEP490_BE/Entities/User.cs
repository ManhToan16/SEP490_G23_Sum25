using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class User
    {
        public User()
        {
            Appointments = new HashSet<Appointment>();
            AuditLogs = new HashSet<AuditLog>();
            DoctorProfiles = new HashSet<DoctorProfile>();
            ExaminationResults = new HashSet<ExaminationResult>();
            LaboratoryResults = new HashSet<LaboratoryResult>();
            ScheduleChangeRequestRequesters = new HashSet<ScheduleChangeRequest>();
            ScheduleChangeRequestTargetUsers = new HashSet<ScheduleChangeRequest>();
            Schedules = new HashSet<Schedule>();
            TransactionHistories = new HashSet<TransactionHistory>();
            Transactions = new HashSet<Transaction>();
            UserRoles = new HashSet<UserRole>();
            Visits = new HashSet<Visit>();
        }

        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<Appointment> Appointments { get; set; }
        public virtual ICollection<AuditLog> AuditLogs { get; set; }
        public virtual ICollection<DoctorProfile> DoctorProfiles { get; set; }
        public virtual ICollection<ExaminationResult> ExaminationResults { get; set; }
        public virtual ICollection<LaboratoryResult> LaboratoryResults { get; set; }
        public virtual ICollection<ScheduleChangeRequest> ScheduleChangeRequestRequesters { get; set; }
        public virtual ICollection<ScheduleChangeRequest> ScheduleChangeRequestTargetUsers { get; set; }
        public virtual ICollection<Schedule> Schedules { get; set; }
        public virtual ICollection<TransactionHistory> TransactionHistories { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
        public virtual ICollection<Visit> Visits { get; set; }
    }
}

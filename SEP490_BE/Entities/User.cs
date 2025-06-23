using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class User
    {
        public User()
        {
            AppointmentAssignedDoctors = new HashSet<Appointment>();
            AppointmentRequiredDoctors = new HashSet<Appointment>();
            AuditLogs = new HashSet<AuditLog>();
            DoctorProfiles = new HashSet<DoctorProfile>();
            DoctorSchedules = new HashSet<DoctorSchedule>();
            ExaminationResults = new HashSet<ExaminationResult>();
            LaboratoryResults = new HashSet<LaboratoryResult>();
            UserRoles = new HashSet<UserRole>();
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

        public virtual ICollection<Appointment> AppointmentAssignedDoctors { get; set; }
        public virtual ICollection<Appointment> AppointmentRequiredDoctors { get; set; }
        public virtual ICollection<AuditLog> AuditLogs { get; set; }
        public virtual ICollection<DoctorProfile> DoctorProfiles { get; set; }
        public virtual ICollection<DoctorSchedule> DoctorSchedules { get; set; }
        public virtual ICollection<ExaminationResult> ExaminationResults { get; set; }
        public virtual ICollection<LaboratoryResult> LaboratoryResults { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
    }
}

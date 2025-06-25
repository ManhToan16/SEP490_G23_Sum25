using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace SEP490_BE.Entities
{
    public partial class KhanhAnNeurologyClinicContext : DbContext
    {
        public KhanhAnNeurologyClinicContext()
        {
        }

        public KhanhAnNeurologyClinicContext(DbContextOptions<KhanhAnNeurologyClinicContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Appointment> Appointments { get; set; } = null!;
        public virtual DbSet<Assignment> Assignments { get; set; } = null!;
        public virtual DbSet<AssignmentService> AssignmentServices { get; set; } = null!;
        public virtual DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public virtual DbSet<DoctorProfile> DoctorProfiles { get; set; } = null!;
        public virtual DbSet<DoctorSchedule> DoctorSchedules { get; set; } = null!;
        public virtual DbSet<ExaminationResult> ExaminationResults { get; set; } = null!;
        public virtual DbSet<ExaminationRoom> ExaminationRooms { get; set; } = null!;
        public virtual DbSet<LaboratoryFile> LaboratoryFiles { get; set; } = null!;
        public virtual DbSet<LaboratoryResult> LaboratoryResults { get; set; } = null!;
        public virtual DbSet<LaboratoryRoom> LaboratoryRooms { get; set; } = null!;
        public virtual DbSet<Material> Materials { get; set; } = null!;
        public virtual DbSet<MedicalRecord> MedicalRecords { get; set; } = null!;
        public virtual DbSet<PatientProfile> PatientProfiles { get; set; } = null!;
        public virtual DbSet<Permission> Permissions { get; set; } = null!;
        public virtual DbSet<Prescription> Prescriptions { get; set; } = null!;
        public virtual DbSet<PrescriptionItem> PrescriptionItems { get; set; } = null!;
        public virtual DbSet<Queue> Queues { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<RolePermission> RolePermissions { get; set; } = null!;
        public virtual DbSet<Service> Services { get; set; } = null!;
        public virtual DbSet<TechnicianSchedule> TechnicianSchedules { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<UserRole> UserRoles { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Server=localhost;Database=KhanhAnNeurologyClinic;User Id=sa;Password=123;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

                entity.Property(e => e.AssignedDoctorId).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.DateOfBirth).HasColumnType("date");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.ExpiredAt).HasColumnType("datetime");

                entity.Property(e => e.Gender).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.PatientProfileId).HasMaxLength(100);

                entity.Property(e => e.PhoneNumber).HasMaxLength(10);

                entity.Property(e => e.RequiredDoctorId).HasMaxLength(100);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('Pending')");

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(18, 2)")
                    .HasDefaultValueSql("((0))");

                entity.HasOne(d => d.AssignedDoctor)
                    .WithMany(p => p.AppointmentAssignedDoctors)
                    .HasForeignKey(d => d.AssignedDoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Appointme__Assig__5CD6CB2B");

                entity.HasOne(d => d.PatientProfile)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(d => d.PatientProfileId)
                    .HasConstraintName("FK__Appointme__Patie__5AEE82B9");

                entity.HasOne(d => d.RequiredDoctor)
                    .WithMany(p => p.AppointmentRequiredDoctors)
                    .HasForeignKey(d => d.RequiredDoctorId)
                    .HasConstraintName("FK__Appointme__Requi__5BE2A6F2");
            });

            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AppointmentId).HasMaxLength(100);

                entity.Property(e => e.CreateAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.IsPrioritized).HasDefaultValueSql("((0))");

                entity.Property(e => e.LaboratoryRoomId).HasMaxLength(100);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('Waiting')");

                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.Assignments)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Assignmen__Appoi__6A30C649");

                entity.HasOne(d => d.LaboratoryRoom)
                    .WithMany(p => p.Assignments)
                    .HasForeignKey(d => d.LaboratoryRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Assignmen__Labor__693CA210");
            });

            modelBuilder.Entity<AssignmentService>(entity =>
            {
                entity.Property(e => e.AssignmentId).HasMaxLength(100);

                entity.Property(e => e.ServiceId).HasMaxLength(100);

                entity.HasOne(d => d.Assignment)
                    .WithMany(p => p.AssignmentServices)
                    .HasForeignKey(d => d.AssignmentId)
                    .HasConstraintName("FK__Assignmen__Assig__160F4887");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.AssignmentServices)
                    .HasForeignKey(d => d.ServiceId)
                    .HasConstraintName("FK__Assignmen__Servi__17036CC0");
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.Property(e => e.Action).HasMaxLength(50);

                entity.Property(e => e.ActionTime)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.RecordId).HasMaxLength(100);

                entity.Property(e => e.TableName).HasMaxLength(50);

                entity.Property(e => e.UserId).HasMaxLength(100);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AuditLogs)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__AuditLogs__UserI__412EB0B6");
            });

            modelBuilder.Entity<DoctorProfile>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.DoctorId).HasMaxLength(100);

                entity.Property(e => e.Qualifications).HasMaxLength(255);

                entity.HasOne(d => d.Doctor)
                    .WithMany(p => p.DoctorProfiles)
                    .HasForeignKey(d => d.DoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__DoctorPro__Docto__440B1D61");
            });

            modelBuilder.Entity<DoctorSchedule>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.DoctorId).HasMaxLength(100);

                entity.Property(e => e.ExaminationRoomId).HasMaxLength(100);

                entity.HasOne(d => d.Doctor)
                    .WithMany(p => p.DoctorSchedules)
                    .HasForeignKey(d => d.DoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__DoctorSch__Docto__4D94879B");

                entity.HasOne(d => d.ExaminationRoom)
                    .WithMany(p => p.DoctorSchedules)
                    .HasForeignKey(d => d.ExaminationRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__DoctorSch__Exami__4E88ABD4");
            });

            modelBuilder.Entity<ExaminationResult>(entity =>
            {
                entity.HasIndex(e => e.AccessCode, "UQ__Examinat__24C20D0C0F89D816")
                    .IsUnique();

                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AccessCode).HasMaxLength(50);

                entity.Property(e => e.AppointmentId).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.DoctorId).HasMaxLength(100);

                entity.Property(e => e.IsCompleted).HasDefaultValueSql("((0))");

                entity.Property(e => e.MedicalRecordId).HasMaxLength(100);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Appoi__778AC167");

                entity.HasOne(d => d.Doctor)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.DoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Docto__76969D2E");

                entity.HasOne(d => d.MedicalRecord)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.MedicalRecordId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Medic__75A278F5");
            });

            modelBuilder.Entity<ExaminationRoom>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<LaboratoryFile>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.LaboratoryResultId).HasMaxLength(100);

                entity.Property(e => e.Url).HasMaxLength(255);

                entity.HasOne(d => d.LaboratoryResult)
                    .WithMany(p => p.LaboratoryFiles)
                    .HasForeignKey(d => d.LaboratoryResultId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Labor__01142BA1");
            });

            modelBuilder.Entity<LaboratoryResult>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AssignmentId).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ExaminationResultId).HasMaxLength(100);

                entity.Property(e => e.TechnicianId).HasMaxLength(100);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Assignment)
                    .WithMany(p => p.LaboratoryResults)
                    .HasForeignKey(d => d.AssignmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Assig__7E37BEF6");

                entity.HasOne(d => d.ExaminationResult)
                    .WithMany(p => p.LaboratoryResults)
                    .HasForeignKey(d => d.ExaminationResultId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Exami__7C4F7684");

                entity.HasOne(d => d.Technician)
                    .WithMany(p => p.LaboratoryResults)
                    .HasForeignKey(d => d.TechnicianId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Techn__7D439ABD");
            });

            modelBuilder.Entity<LaboratoryRoom>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Material>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Category).HasMaxLength(100);

                entity.Property(e => e.Code).HasMaxLength(50);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Name).HasMaxLength(255);

                entity.Property(e => e.Unit).HasMaxLength(50);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");
            });

            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.PatientProfileId).HasMaxLength(100);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.PatientProfile)
                    .WithMany(p => p.MedicalRecords)
                    .HasForeignKey(d => d.PatientProfileId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__MedicalRe__Patie__6EF57B66");
            });

            modelBuilder.Entity<PatientProfile>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.DateOfBirth).HasColumnType("date");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.Gender).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.PhoneNumber).HasMaxLength(10);
            });

            modelBuilder.Entity<Permission>(entity =>
            {
                entity.HasKey(e => e.Name)
                    .HasName("PK__Permissi__737584F7D0E26CB6");

                entity.Property(e => e.Name).HasMaxLength(50);

                entity.Property(e => e.Description).HasMaxLength(255);
            });

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ExaminationResultId).HasMaxLength(100);

                entity.HasOne(d => d.ExaminationResult)
                    .WithMany(p => p.Prescriptions)
                    .HasForeignKey(d => d.ExaminationResultId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Prescript__Exami__04E4BC85");
            });

            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Dosage).HasMaxLength(255);

                entity.Property(e => e.DrugName).HasMaxLength(255);

                entity.Property(e => e.Duration).HasMaxLength(255);

                entity.Property(e => e.Frequency).HasMaxLength(255);

                entity.Property(e => e.PrescriptionId).HasMaxLength(100);

                entity.HasOne(d => d.Prescription)
                    .WithMany(p => p.PrescriptionItems)
                    .HasForeignKey(d => d.PrescriptionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Prescript__Presc__07C12930");
            });

            modelBuilder.Entity<Queue>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AppointmentId).HasMaxLength(100);

                entity.Property(e => e.CreateAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ExaminationRoomId).HasMaxLength(100);

                entity.Property(e => e.IsPrioritized).HasDefaultValueSql("((0))");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('Waiting')");

                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.Queues)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Queues__Appointm__6383C8BA");

                entity.HasOne(d => d.ExaminationRoom)
                    .WithMany(p => p.Queues)
                    .HasForeignKey(d => d.ExaminationRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Queues__Examinat__628FA481");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Name)
                    .HasName("PK__Roles__737584F7485ADBD5");

                entity.Property(e => e.Name).HasMaxLength(50);

                entity.Property(e => e.Description).HasMaxLength(200);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.Property(e => e.PermissionName).HasMaxLength(50);

                entity.Property(e => e.RoleName).HasMaxLength(50);

                entity.HasOne(d => d.PermissionNameNavigation)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(d => d.PermissionName)
                    .HasConstraintName("FK__RolePermi__Permi__1332DBDC");

                entity.HasOne(d => d.RoleNameNavigation)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(d => d.RoleName)
                    .HasConstraintName("FK__RolePermi__RoleN__123EB7A3");
            });

            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.LaboratoryRoomsId).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

                entity.HasOne(d => d.LaboratoryRooms)
                    .WithMany(p => p.Services)
                    .HasForeignKey(d => d.LaboratoryRoomsId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Services__Labora__4AB81AF0");
            });

            modelBuilder.Entity<TechnicianSchedule>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.LaboratoryRoomId).HasMaxLength(100);

                entity.Property(e => e.TechnicianId).HasMaxLength(100);

                entity.HasOne(d => d.LaboratoryRoom)
                    .WithMany(p => p.TechnicianSchedules)
                    .HasForeignKey(d => d.LaboratoryRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Technicia__Labor__52593CB8");

                entity.HasOne(d => d.Technician)
                    .WithMany(p => p.TechnicianSchedules)
                    .HasForeignKey(d => d.TechnicianId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Technicia__Techn__5165187F");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.PhoneNumber, "UQ__Users__85FB4E38A2C0C29F")
                    .IsUnique();

                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.DateOfBirth).HasColumnType("date");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.Gender).HasMaxLength(10);

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.Password).HasMaxLength(255);

                entity.Property(e => e.PhoneNumber).HasMaxLength(10);
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.Property(e => e.RoleName).HasMaxLength(50);

                entity.Property(e => e.UserId).HasMaxLength(100);

                entity.HasOne(d => d.RoleNameNavigation)
                    .WithMany(p => p.UserRoles)
                    .HasForeignKey(d => d.RoleName)
                    .HasConstraintName("FK__UserRoles__RoleN__0F624AF8");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserRoles)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__UserRoles__UserI__0E6E26BF");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

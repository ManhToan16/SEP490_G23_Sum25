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
        public virtual DbSet<Category> Categories { get; set; } = null!;
        public virtual DbSet<DoctorProfile> DoctorProfiles { get; set; } = null!;
        public virtual DbSet<ExaminationResult> ExaminationResults { get; set; } = null!;
        public virtual DbSet<ExaminationRoom> ExaminationRooms { get; set; } = null!;
        public virtual DbSet<LaboratoryFile> LaboratoryFiles { get; set; } = null!;
        public virtual DbSet<LaboratoryResult> LaboratoryResults { get; set; } = null!;
        public virtual DbSet<LaboratoryRoom> LaboratoryRooms { get; set; } = null!;
        public virtual DbSet<Material> Materials { get; set; } = null!;
        public virtual DbSet<MedicalRecord> MedicalRecords { get; set; } = null!;
        public virtual DbSet<Medicine> Medicines { get; set; } = null!;
        public virtual DbSet<PatientProfile> PatientProfiles { get; set; } = null!;
        public virtual DbSet<Permission> Permissions { get; set; } = null!;
        public virtual DbSet<Prescription> Prescriptions { get; set; } = null!;
        public virtual DbSet<PrescriptionItem> PrescriptionItems { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<RolePermission> RolePermissions { get; set; } = null!;
        public virtual DbSet<Schedule> Schedules { get; set; } = null!;
        public virtual DbSet<ScheduleChangeRequest> ScheduleChangeRequests { get; set; } = null!;
        public virtual DbSet<Service> Services { get; set; } = null!;
        public virtual DbSet<Supplier> Suppliers { get; set; } = null!;
        public virtual DbSet<TimeSlot> TimeSlots { get; set; } = null!;
        public virtual DbSet<Transaction> Transactions { get; set; } = null!;
        public virtual DbSet<TransactionHistory> TransactionHistories { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<UserRole> UserRoles { get; set; } = null!;
        public virtual DbSet<Visit> Visits { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var config = new ConfigurationBuilder()
                    .SetBasePath(AppContext.BaseDirectory)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                var connectionString = config.GetConnectionString("MyDB");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

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
                    .HasDefaultValueSql("('WAITING_FOR_CONFIRMATION')");

                entity.Property(e => e.TimeSlotId).HasMaxLength(100);

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(18, 2)")
                    .HasDefaultValueSql("((0))");

                entity.HasOne(d => d.PatientProfile)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(d => d.PatientProfileId)
                    .HasConstraintName("FK__Appointme__Patie__6C190EBB");

                entity.HasOne(d => d.RequiredDoctor)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(d => d.RequiredDoctorId)
                    .HasConstraintName("FK__Appointme__Requi__6D0D32F4");

                entity.HasOne(d => d.TimeSlot)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(d => d.TimeSlotId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Appointme__TimeS__6E01572D");
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
                    .HasDefaultValueSql("('PENDING')");

                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.Assignments)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Assignmen__Appoi__7F2BE32F");

                entity.HasOne(d => d.LaboratoryRoom)
                    .WithMany(p => p.Assignments)
                    .HasForeignKey(d => d.LaboratoryRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Assignmen__Labor__7E37BEF6");
            });

            modelBuilder.Entity<AssignmentService>(entity =>
            {
                entity.Property(e => e.AssignmentId).HasMaxLength(100);

                entity.Property(e => e.ServiceId).HasMaxLength(100);

                entity.HasOne(d => d.Assignment)
                    .WithMany(p => p.AssignmentServices)
                    .HasForeignKey(d => d.AssignmentId)
                    .HasConstraintName("FK__Assignmen__Assig__3E1D39E1");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.AssignmentServices)
                    .HasForeignKey(d => d.ServiceId)
                    .HasConstraintName("FK__Assignmen__Servi__3F115E1A");
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
                    .HasConstraintName("FK__AuditLogs__UserI__48CFD27E");
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Name).HasMaxLength(255);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");
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
                    .HasConstraintName("FK__DoctorPro__Docto__4BAC3F29");
            });

            modelBuilder.Entity<ExaminationResult>(entity =>
            {
                entity.HasIndex(e => e.AccessCode, "UQ__Examinat__24C20D0C5D5E6AB0")
                    .IsUnique();

                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AccessCode).HasMaxLength(50);

                entity.Property(e => e.AppointmentId).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.DoctorId).HasMaxLength(100);

                entity.Property(e => e.MedicalRecordId).HasMaxLength(100);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Appoi__0B91BA14");

                entity.HasOne(d => d.Doctor)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.DoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Docto__0A9D95DB");

                entity.HasOne(d => d.MedicalRecord)
                    .WithMany(p => p.ExaminationResults)
                    .HasForeignKey(d => d.MedicalRecordId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Examinati__Medic__09A971A2");
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
                    .HasConstraintName("FK__Laborator__Labor__151B244E");
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
                    .HasConstraintName("FK__Laborator__Assig__123EB7A3");

                entity.HasOne(d => d.ExaminationResult)
                    .WithMany(p => p.LaboratoryResults)
                    .HasForeignKey(d => d.ExaminationResultId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Exami__10566F31");

                entity.HasOne(d => d.Technician)
                    .WithMany(p => p.LaboratoryResults)
                    .HasForeignKey(d => d.TechnicianId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Laborator__Techn__114A936A");
            });

            modelBuilder.Entity<LaboratoryRoom>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Material>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.CategoryId).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Name).HasMaxLength(255);

                entity.Property(e => e.SupplierId).HasMaxLength(100);

                entity.Property(e => e.Unit).HasMaxLength(50);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Category)
                    .WithMany(p => p.Materials)
                    .HasForeignKey(d => d.CategoryId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Materials__Categ__2CF2ADDF");

                entity.HasOne(d => d.Supplier)
                    .WithMany(p => p.Materials)
                    .HasForeignKey(d => d.SupplierId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Materials__Suppl__2BFE89A6");
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
                    .HasConstraintName("FK__MedicalRe__Patie__03F0984C");
            });

            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(255);

                entity.Property(e => e.Packaging).HasMaxLength(50);

                entity.Property(e => e.Unit).HasMaxLength(100);
            });

            modelBuilder.Entity<PatientProfile>(entity =>
            {
                entity.HasIndex(e => e.CitizenId, "UQ__PatientP__6E49FA0D997BF085")
                    .IsUnique();

                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

                entity.Property(e => e.CitizenId).HasMaxLength(20);

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
                    .HasName("PK__Permissi__737584F72CA36E55");

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
                    .HasConstraintName("FK__Prescript__Exami__1AD3FDA4");
            });

            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Dosage).HasMaxLength(255);

                entity.Property(e => e.Duration).HasMaxLength(255);

                entity.Property(e => e.Frequency).HasMaxLength(255);

                entity.Property(e => e.MedicineId).HasMaxLength(100);

                entity.Property(e => e.PrescriptionId).HasMaxLength(100);

                entity.HasOne(d => d.Medicine)
                    .WithMany(p => p.PrescriptionItems)
                    .HasForeignKey(d => d.MedicineId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Prescript__Medic__1EA48E88");

                entity.HasOne(d => d.Prescription)
                    .WithMany(p => p.PrescriptionItems)
                    .HasForeignKey(d => d.PrescriptionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Prescript__Presc__1DB06A4F");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Name)
                    .HasName("PK__Roles__737584F79807C0DC");

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
                    .HasConstraintName("FK__RolePermi__Permi__44FF419A");

                entity.HasOne(d => d.RoleNameNavigation)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(d => d.RoleName)
                    .HasConstraintName("FK__RolePermi__RoleN__440B1D61");
            });

            modelBuilder.Entity<Schedule>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Role).HasMaxLength(100);

                entity.Property(e => e.RoomId).HasMaxLength(100);

                entity.Property(e => e.RoomType).HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('SCHEDULED')");

                entity.Property(e => e.TimeSlotId).HasMaxLength(100);

                entity.Property(e => e.UserId).HasMaxLength(100);

                entity.HasOne(d => d.TimeSlot)
                    .WithMany(p => p.Schedules)
                    .HasForeignKey(d => d.TimeSlotId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Schedules__TimeS__59FA5E80");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Schedules)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Schedules__UserI__59063A47");
            });

            modelBuilder.Entity<ScheduleChangeRequest>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.RequesterId).HasMaxLength(100);

                entity.Property(e => e.RequesterScheduleId).HasMaxLength(100);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('PENDING')");

                entity.Property(e => e.TargetScheduleId).HasMaxLength(100);

                entity.Property(e => e.TargetUserId).HasMaxLength(100);

                entity.HasOne(d => d.Requester)
                    .WithMany(p => p.ScheduleChangeRequestRequesters)
                    .HasForeignKey(d => d.RequesterId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ScheduleC__Reque__5EBF139D");

                entity.HasOne(d => d.RequesterSchedule)
                    .WithMany(p => p.ScheduleChangeRequestRequesterSchedules)
                    .HasForeignKey(d => d.RequesterScheduleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ScheduleC__Reque__60A75C0F");

                entity.HasOne(d => d.TargetSchedule)
                    .WithMany(p => p.ScheduleChangeRequestTargetSchedules)
                    .HasForeignKey(d => d.TargetScheduleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ScheduleC__Targe__619B8048");

                entity.HasOne(d => d.TargetUser)
                    .WithMany(p => p.ScheduleChangeRequestTargetUsers)
                    .HasForeignKey(d => d.TargetUserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ScheduleC__Targe__5FB337D6");
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
                    .HasConstraintName("FK__Services__Labora__5441852A");
            });

            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Address).HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(255);

                entity.Property(e => e.PhoneNumber).HasMaxLength(10);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");
            });

            modelBuilder.Entity<TimeSlot>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.MaterialId).HasMaxLength(100);

                entity.Property(e => e.RoomId).HasMaxLength(100);

                entity.Property(e => e.RoomType).HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('PENDING')");

                entity.Property(e => e.TransactionType).HasMaxLength(50);

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UserId).HasMaxLength(100);

                entity.HasOne(d => d.Material)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.MaterialId)
                    .HasConstraintName("FK__Transacti__Mater__3587F3E0");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Transacti__UserI__367C1819");
            });

            modelBuilder.Entity<TransactionHistory>(entity =>
            {
                entity.ToTable("TransactionHistory");

                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.ChangedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ChangedBy).HasMaxLength(100);

                entity.Property(e => e.TransactionId).HasMaxLength(100);

                entity.HasOne(d => d.ChangedByNavigation)
                    .WithMany(p => p.TransactionHistories)
                    .HasForeignKey(d => d.ChangedBy)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Transacti__Chang__3B40CD36");

                entity.HasOne(d => d.Transaction)
                    .WithMany(p => p.TransactionHistories)
                    .HasForeignKey(d => d.TransactionId)
                    .HasConstraintName("FK__Transacti__Trans__3A4CA8FD");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.PhoneNumber, "UQ__Users__85FB4E38268F4D4D")
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
                    .HasConstraintName("FK__UserRoles__RoleN__412EB0B6");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserRoles)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__UserRoles__UserI__403A8C7D");
            });

            modelBuilder.Entity<Visit>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(100);

                entity.Property(e => e.AppointmentId).HasMaxLength(100);

                entity.Property(e => e.AssignedDoctorId).HasMaxLength(100);

                entity.Property(e => e.CreateAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ExaminationRoomId).HasMaxLength(100);

                entity.Property(e => e.IsPrioritized).HasDefaultValueSql("((0))");

                entity.Property(e => e.PatientName).HasMaxLength(100);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('WAITING')");

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(18, 2)")
                    .HasDefaultValueSql("((200000))");

                entity.HasOne(d => d.Appointment)
                    .WithMany(p => p.Visits)
                    .HasForeignKey(d => d.AppointmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Visits__Appointm__76969D2E");

                entity.HasOne(d => d.AssignedDoctor)
                    .WithMany(p => p.Visits)
                    .HasForeignKey(d => d.AssignedDoctorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Visits__Assigned__778AC167");

                entity.HasOne(d => d.ExaminationRoom)
                    .WithMany(p => p.Visits)
                    .HasForeignKey(d => d.ExaminationRoomId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Visits__Examinat__75A278F5");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

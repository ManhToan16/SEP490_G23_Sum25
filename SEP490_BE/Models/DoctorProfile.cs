using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class DoctorProfile
    {
        public string Id { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string? Qualifications { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public string? Avatar { get; set; }

        public virtual User Doctor { get; set; } = null!;
    }
}

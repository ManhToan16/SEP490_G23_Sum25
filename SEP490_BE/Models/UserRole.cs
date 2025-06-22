using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class UserRole
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string RoleName { get; set; } = null!;

        public virtual Role RoleNameNavigation { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}

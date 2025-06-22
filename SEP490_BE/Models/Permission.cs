using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class Permission
    {
        public Permission()
        {
            RolePermissions = new HashSet<RolePermission>();
        }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public virtual ICollection<RolePermission> RolePermissions { get; set; }
    }
}

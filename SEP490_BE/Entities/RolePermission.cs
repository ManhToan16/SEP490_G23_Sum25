using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class RolePermission
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = null!;
        public string PermissionName { get; set; } = null!;

        public virtual Permission PermissionNameNavigation { get; set; } = null!;
        public virtual Role RoleNameNavigation { get; set; } = null!;
    }
}

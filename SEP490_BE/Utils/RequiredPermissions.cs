using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SEP490_BE.Utils
{
    public class RequiredPermissionsAttribute : TypeFilterAttribute
    {
        public RequiredPermissionsAttribute(params string[] permissions)
            : base(typeof(RequiredPermissionsFilter))
        {
            Arguments = new object[] { permissions };
        }
    }

    public class RequiredPermissionsFilter : IAuthorizationFilter
    {
        private readonly string[] _permissions;

        public RequiredPermissionsFilter(string[] permissions)
        {
            _permissions = permissions;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!PermissionChecker.HasPermissions(user, _permissions))
            {
                context.Result = new ForbidResult();
            }
        }
    }

    public static class PermissionChecker
    {
        public static bool HasPermissions(ClaimsPrincipal user, string[] requiredPermissions)
        {
            var permissionsClaim = user.FindFirst("Permissions")?.Value;

            if (string.IsNullOrEmpty(permissionsClaim))
                return false;

            var userPermissions = permissionsClaim.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            return requiredPermissions.All(rp => userPermissions.Contains(rp));
        }
    }

}

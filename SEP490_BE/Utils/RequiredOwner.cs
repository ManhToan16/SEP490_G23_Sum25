using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using SEP490_BE.Constants;

namespace BackendProject.Utils
{
    public class RequiredOwnerAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            var routeData = context.RouteData.Values["userId"];
            if (routeData == null)
            {
                context.Result = new ChallengeResult(); 
                return;
            }

            var jwtUserId = user.FindFirst("UserId")?.Value;

            var isAdmin = user.IsInRole(RoleConstants.Admin);

            if (jwtUserId != routeData.ToString() && !isAdmin)
            {
                context.Result = new ForbidResult();
            }
        }
    }


}

namespace SEP490_BE.Constants
{
    public class MessageConstants
    {
        #region System Exception
        public const string UNCATEGORIZED_ERROR = "Oops... Something went wrong!";
        public const string VALIDATION_ERROR = "Validation Failed.";
        public const string CONFLICT_ERROR = "Conflict data.";
        public const string UNAUTHENTICATED_ERROR = "Unauthenticated.";
        public const string UNAUTHORIZED_ERROR = "You do not have permission.";
        public const string FORBIDDEN = "Forbidden.";
        public const string API_KEY_ERROR = "API Key is missing or invalid";
        #endregion

        #region DB Exception
        public const string DB_ERROR = "Database error. Please try again.";
        public const string DB_CONCURRENCY_ERROR = "Data conflict. Please reload.";
        #endregion

        #region Not Found
        public const string NOT_FOUND = "Resource not found.";
        public const string ENDPOINT_NOT_FOUND = "Endpoint not found.";
        public const string METHOD_NOT_FOUND = "Method not found.";
        #endregion

        #region CRUD Common
        public const string GET_SUCCESS = "Get data successful.";
        public const string POST_SUCCESS = "Create data successful.";
        public const string PUT_SUCCESS = "Update data successful.";
        public const string DELETE_SUCCESS = "Delete data successful.";
        #endregion

        #region Auth
        public const string LOGIN_SUCCESS = "Login successful.";
        public const string REGISTER_SUCCESS = "Registration successful.";
        public const string LOGOUT_SUCCESS = "Log out successful.";
        public const string REFRESH_TOKEN_SUCCESS = "Refresh token successful.";

        public const string PHONE_NUMBER_VERIFIED_SUCCESS = "Phone number verified successful.";
        public const string PHONE_NUMBER_EXISTS = "This phone number has been registered.";
        public const string INVALID_PHONE_NUMBER_CHARACTER = "The phone number is in wrong format.";
        public const string INVALID_PHONE_NUMBER_LENGTH = "The phone number length must be in 10 characters.";

        public const string NULL_USERNAME = "The name must not be empty.";
        public const string INVALID_USERNAME_CHARACTER = "The name must not contain special characters.";
        public const string INVALID_USERNAME_LENGTH = "The name length must be in 2-100 characters.";

        public const string EMAIL_EXISTS = "This email has been registered.";
        public const string INVALID_EMAIL = "The email address is in wrong format.";

        public const string INVALID_LOGIN = "Invalid email or password.";
        public const string INVALID_PASSWORD = "The password must has at least 8 characters";
        public const string INVALID_REPASSWORD = "The repassword has to be the same with the password";
        public const string INVALID_TOKEN = "Invalid Token";
        public const string FORGOT_PASSWORD_REQUEST_SUCCESS = "Check your email to change password";
        public const string CHANGE_PASSWORD_SUCCESS = "Change password successful.";
        #endregion

        #region User
        public const string USER_NOT_FOUND = "User not found.";


        #endregion

        #region Role
        public const string ROLE_NOT_FOUND = "Role not found.";


        #endregion
    }
}

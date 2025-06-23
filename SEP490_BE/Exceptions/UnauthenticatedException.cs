namespace SEP490_BE.Exceptions
{
    public class UnauthenticatedException : Exception
    {
        public UnauthenticatedException(string message) : base(message) { }
    }
}

namespace IdentityService.API.Commons;

public static class ApiRoutes
{
    private const string Root = "api";
    private const string Version = "v1";
    private const string Base = Root + "/" + Version;

    public static class Auth
    {
        public const string Base = ApiRoutes.Base + "/auth";
        public const string Login = "login";
        public const string Register = "register";
        public const string Refresh = "refresh";
        public const string Logout = "logout";
    }

    public static class Users
    {
        public const string Base = ApiRoutes.Base + "/users";
        public const string GetById = "{id}";        
        public const string Update = "{id}";      
        public const string Delete = "{id}";
    }
}

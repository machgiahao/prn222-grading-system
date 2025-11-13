
namespace GradingService.API.Common.Constants;

public static class ApiRoutes
{
    private const string Root = "api";

    private const string Version = "v1";

    private const string Base = Root + "/" + Version;

    public static class Submissions
    {
        public const string Base = ApiRoutes.Base + "/submissions";
        public const string Upload = "upload";
    }
}

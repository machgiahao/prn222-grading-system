
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
        public const string Assign = "assign";
        public const string AutoAssign = "auto-assign";
        public const string MyTasks = "my-tasks";
        public const string GradingDetails = "{id}/grading-details";
        public const string ModerationQueue = "moderation-queue";
        public const string VerifyViolation = "verify-violation";
    }

    public static class Grades
    {
        public const string Base = ApiRoutes.Base + "/grades";

    }
}

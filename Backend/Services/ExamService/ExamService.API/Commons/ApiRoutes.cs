namespace ExamService.API.Commons;

public static class ApiRoutes
{
    private const string Root = "api";
    private const string Version = "v1";
    private const string Base = Root + "/" + Version;

    public static class Semesters
    {
        public const string Base = ApiRoutes.Base + "/semester";
        public const string GetById = "{id}";
    }

    public static class Subjects
    {
        public const string Base = ApiRoutes.Base + "/subject";
        public const string GetById = "{id}";
    }

    public static class Rubrics
    {
        public const string Base = ApiRoutes.Base + "/rubric";
    }
}
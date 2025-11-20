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
        public const string Update = "{id}";
        public const string Delete = "{id}";
    }

    public static class Subjects
    {
        public const string Base = ApiRoutes.Base + "/subject";
        public const string GetById = "{id}";
        public const string Update = "{id}";
        public const string Delete = "{id}";
    }

    public static class Exams
    {
        public const string Base = ApiRoutes.Base + "/exams";
        public const string GetById = "{id}";
        public const string Update = "{id}";
        public const string Delete = "{id}";
        public const string Statistics = "{id}/statistics";
    }

    public static class Rubrics
    {
        public const string Base = ApiRoutes.Base + "/rubrics";
        public const string GetById = "{id}";
        public const string Update = "{id}";
        public const string Delete = "{id}";
        
        public const string AddItem = "{id}/items";
        public const string UpdateItem = "{rubricId}/items/{itemId}";
        public const string DeleteItem = "{rubricId}/items/{itemId}";
    }
}
using ExamService.Application.Dtos;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;

namespace ExamService.API.Configurations;

public static class ODataConfig
{
    public static IEdmModel GetEdmModel()
    {
        var builder = new ODataConventionModelBuilder();

        builder.EntitySet<SubjectDto>("subjects");
        builder.EntitySet<SemesterDto>("semesters");

        return builder.GetEdmModel();
    }
}

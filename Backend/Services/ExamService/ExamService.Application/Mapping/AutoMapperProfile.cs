using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Application.Exams.Commands;
using ExamService.Application.Rubrics.Commands;
using ExamService.Application.Semesters.Commands;
using ExamService.Application.Subjects.Commands;
using ExamService.Domain.Entities;

namespace ExamService.Application.Mapping;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<Subject, SubjectDto>();
        CreateMap<CreateSubjectCommand, Subject>().ReverseMap();
        CreateMap<UpdateSubjectCommand, Subject>().ReverseMap();

        CreateMap<Semester, SemesterDto>();
        CreateMap<CreateSemesterCommand, Semester>().ReverseMap();
        CreateMap<UpdateSemesterCommand, Semester>().ReverseMap();

        CreateMap<Exam, ExamDto>()
            .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject.SubjectName))
            .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.Semester.SemesterName));
        CreateMap<CreateExamCommand, Exam>();
        CreateMap<UpdateExamCommand, Exam>();

        CreateMap<Rubric, RubricDto>();
        CreateMap<CreateRubricCommand, Rubric>();

        CreateMap<RubricItem, RubricItemDto>();
        CreateMap<AddRubricItemCommand, RubricItem>();
        CreateMap<UpdateRubricItemCommand, RubricItem>();
    }
}

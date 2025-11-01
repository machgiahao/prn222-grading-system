using AutoMapper;
using ExamService.Application.Dtos;
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
    }
}

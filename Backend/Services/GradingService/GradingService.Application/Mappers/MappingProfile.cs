using AutoMapper;
using GradingService.Application.Dtos;
using GradingService.Domain.Entities;

namespace GradingService.Application.Mappers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Submission, SubmissionTaskDto>();
        CreateMap<RubricItem, RubricItemDto>();
        CreateMap<Submission, GradingDetailsDto>()
            .ForMember(dest => dest.SubmissionId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.RubricItems, opt => opt.MapFrom(src =>
                src.Batch.Exam.Rubric.Items
            ));

        CreateMap<Submission, ModerationTaskDto>()
            .ForMember(dest => dest.ViolationCount, opt => opt.MapFrom(src =>
                src.Violations != null ? src.Violations.Count : 0
            ));

        CreateMap<Submission, ModerationTaskDto>()
            .ForMember(dest => dest.ViolationCount, opt => opt.MapFrom(src => src.Violations.Count))
            .ForMember(dest => dest.BatchName, opt => opt.MapFrom(src => src.Batch != null ? src.Batch.RarFilePath : ""))
            .ForMember(dest => dest.Violations, opt => opt.MapFrom(src => src.Violations));

        CreateMap<Violation, ViolationDetailDto>();
    }
}

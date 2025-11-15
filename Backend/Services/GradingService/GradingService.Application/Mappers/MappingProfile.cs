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
    }
}

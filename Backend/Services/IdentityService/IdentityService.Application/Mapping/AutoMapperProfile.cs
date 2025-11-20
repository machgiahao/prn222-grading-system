using AutoMapper;
using IdentityService.Application.Dtos;
using IdentityService.Domain.Entities;

namespace IdentityService.Application.Mapping;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                src.UserRoles.Select(ur => ur.Role.Name).ToList()));

    }
}

using AutoMapper;
using IdentityService.Application.Dtos;
using IdentityService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Pagination;

namespace IdentityService.Application.Users.Queries;

public record GetAllUsersQuery(
    PaginationRequest PaginationRequest,
    string? RoleName = null
) : IQuery<PaginatedResult<UserDto>>;

public class GetAllUsersQueryHandler : IQueryHandler<GetAllUsersQuery, PaginatedResult<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(
        IUserRepository userRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<UserDto>> Handle(
        GetAllUsersQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _userRepository.GetAllWithFiltersAsync(
            request.PaginationRequest.PageIndex,
            request.PaginationRequest.PageSize,
            request.RoleName,
            cancellationToken);

        var dtos = _mapper.Map<List<UserDto>>(items);

        return new PaginatedResult<UserDto>(
            request.PaginationRequest.PageIndex,
            request.PaginationRequest.PageSize,
            totalCount,
            dtos
        );
    }
}

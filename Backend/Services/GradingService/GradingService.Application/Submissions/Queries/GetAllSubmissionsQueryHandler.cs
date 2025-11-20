using AutoMapper;
using GradingService.Application.Dtos;
using GradingService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Pagination;

namespace GradingService.Application.Submissions.Queries;

public record GetAllSubmissionsQuery(
    PaginationRequest PaginationRequest,
    Guid? ExamId = null,
    Guid? SubmissionBatchId = null,
    string? Status = null
) : IQuery<PaginatedResult<SubmissionDto>>;

public class GetAllSubmissionsQueryHandler : IQueryHandler<GetAllSubmissionsQuery, PaginatedResult<SubmissionDto>>
{
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IMapper _mapper;

    public GetAllSubmissionsQueryHandler(
        ISubmissionRepository submissionRepository,
        IMapper mapper)
    {
        _submissionRepository = submissionRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<SubmissionDto>> Handle(
        GetAllSubmissionsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _submissionRepository.GetAllWithFiltersAsync(
            request.PaginationRequest.PageIndex,
            request.PaginationRequest.PageSize,
            request.ExamId,
            request.SubmissionBatchId,
            request.Status,
            cancellationToken);

        // Map sang DTO
        var dtos = _mapper.Map<List<SubmissionDto>>(items);

        // PaginatedResult
        return new PaginatedResult<SubmissionDto>(
            request.PaginationRequest.PageIndex,
            request.PaginationRequest.PageSize,
            totalCount,
            dtos
        );
    }
}

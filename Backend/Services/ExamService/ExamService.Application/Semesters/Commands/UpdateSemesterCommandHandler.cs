using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using FluentValidation;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Semesters.Commands;

public sealed record UpdateSemesterCommand(Guid Id, string SemesterName) : ICommand<Guid>;

public class UpdateSemesterCommandValidator : AbstractValidator<UpdateSemesterCommand>
{
    public UpdateSemesterCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.SemesterName).NotEmpty().WithMessage("Semester Name is require.");
    }
}

public class UpdateSemesterCommandHandler : ICommandHandler<UpdateSemesterCommand, Guid>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSemesterCommandHandler(ISemesterRepository semesterRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _semesterRepository = semesterRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(UpdateSemesterCommand request, CancellationToken cancellationToken)
    {
        var semester = await _semesterRepository.GetByIdAsync(request.Id, cancellationToken);
        if (semester == null)
        {
            throw new SemesterNotFoundException(request.Id);
        }

        _mapper.Map(request, semester);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return semester.Id;
    }
}

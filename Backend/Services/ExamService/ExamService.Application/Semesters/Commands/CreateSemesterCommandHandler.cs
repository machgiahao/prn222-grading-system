using AutoMapper;
using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using FluentValidation;
using MediatR;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Semesters.Commands;

public sealed record CreateSemesterCommand(string SemesterCode, string SemesterName) : ICommand<Guid>;

public class CreateSemesterCommandValidator : AbstractValidator<CreateSemesterCommand>
{
    public CreateSemesterCommandValidator()
    {
        RuleFor(x => x.SemesterCode)
            .NotEmpty().WithMessage("Semester code is required.")
            .MaximumLength(10).WithMessage("Semester code must not exceed 10 characters.");
        RuleFor(x => x.SemesterName)
            .NotEmpty().WithMessage("Semester name is required.")
            .MaximumLength(100).WithMessage("Semester name must not exceed 100 characters.");
    }
}

public class CreateSemesterCommandHandler : ICommandHandler<CreateSemesterCommand, Guid>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSemesterCommandHandler(ISemesterRepository semesterRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _semesterRepository = semesterRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateSemesterCommand command, CancellationToken cancellationToken)
    {
        var existing = await _semesterRepository.GetByCodeAsync(command.SemesterCode, cancellationToken);
        if(existing != null)
        {
            throw new InvalidOperationException($"Semester with code '{command.SemesterCode}' already exists.");
        }

        var semester = _mapper.Map<Semester>(command);
        _semesterRepository.Add(semester);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return semester.Id;
    }
}

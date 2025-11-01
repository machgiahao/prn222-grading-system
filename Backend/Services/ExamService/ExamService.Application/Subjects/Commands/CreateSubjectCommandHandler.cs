using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using FluentValidation;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Subjects.Commands;

public sealed record CreateSubjectCommand(string SubjectCode, string SubjectName) : ICommand<Guid>;

public class CreateSubjectCommandValidator : AbstractValidator<CreateSubjectCommand>
{
    public CreateSubjectCommandValidator()
    {
        RuleFor(x => x.SubjectCode).NotEmpty().WithMessage("Subject Code is require.");
        RuleFor(x => x.SubjectName).NotEmpty().WithMessage("Subject Name is require.");
    }
}

public class CreateSubjectCommandHandler : ICommandHandler<CreateSubjectCommand, Guid>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSubjectCommandHandler(ISubjectRepository subjectRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _subjectRepository = subjectRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateSubjectCommand command, CancellationToken cancellationToken)
    {
        var existingSubject = await _subjectRepository.GetByCodeAsync(command.SubjectCode);
        if (existingSubject != null)
        {
            throw new SubjectBadRequestException($"Subject code '{command.SubjectCode}' is already exist.");
        }

        var subject = _mapper.Map<Subject>(command);

        _subjectRepository.Add(subject);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return subject.Id;
    }
}

using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using FluentValidation;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Subjects.Commands;

public sealed record UpdateSubjectCommand(Guid Id, string SubjectName) : ICommand<Guid>;

public class UpdateSubjectCommandValidator : AbstractValidator<UpdateSubjectCommand>
{
    public UpdateSubjectCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.SubjectName)
            .NotEmpty().WithMessage("SubjectName is require.");
    }
}

public class UpdateSubjectCommandHandler : ICommandHandler<UpdateSubjectCommand, Guid>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSubjectCommandHandler(ISubjectRepository subjectRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _subjectRepository = subjectRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(UpdateSubjectCommand request, CancellationToken cancellationToken)
    {
        var subject = await _subjectRepository.GetByIdAsync(request.Id, cancellationToken);
        if (subject == null)
        {
            throw new SubjectNotFoundException(request.Id);
        }

        _mapper.Map(request, subject);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return subject.Id;
    }
}
using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record AddRubricItemCommand(Guid RubricId, string Criteria, double MaxScore) : ICommand<Guid>;

    public class AddRubricItemCommandHandler : ICommandHandler<AddRubricItemCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AddRubricItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(AddRubricItemCommand request, CancellationToken cancellationToken)
        {
            var rubric = await _unitOfWork.Repository<Rubric>().GetByIdAsync(request.RubricId, cancellationToken);
            if (rubric == null) throw new RubricNotFoundException(request.RubricId);

            var item = _mapper.Map<RubricItem>(request);
            await _unitOfWork.Repository<RubricItem>().AddAsync(item, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}

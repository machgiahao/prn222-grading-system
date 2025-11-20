using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record UpdateRubricItemCommand(Guid Id, string Criteria, double MaxScore) : ICommand<Guid>;

    public class UpdateRubricItemCommandHandler : ICommandHandler<UpdateRubricItemCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateRubricItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(UpdateRubricItemCommand request, CancellationToken cancellationToken)
        {
            var repo = _unitOfWork.Repository<RubricItem>();
            var item = await repo.GetByIdAsync(request.Id, cancellationToken);
            if (item == null) throw new RubricItemNotFoundException(request.Id);

            _mapper.Map(request, item);
            repo.Update(item);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return item.Id;
        }
    }
}

using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<List<User>> GetUsersFromListAsync(List<Guid> ids, CancellationToken cancellationToken);
}

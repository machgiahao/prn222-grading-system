using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using GradingService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(GradingDbContext context) : base(context) { }

    public async Task<List<User>> GetUsersFromListAsync(List<Guid> ids, CancellationToken cancellationToken)
    {
        return await _dbSet.Where(u => ids.Contains(u.Id)).ToListAsync(cancellationToken);
    }

    public async Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }
}

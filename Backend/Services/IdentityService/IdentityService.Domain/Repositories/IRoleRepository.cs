using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string roleName, CancellationToken cancellationToken = default);

    Task<List<Role>> GetRolesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

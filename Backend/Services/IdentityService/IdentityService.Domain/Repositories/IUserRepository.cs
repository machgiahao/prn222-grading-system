using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string username, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    void Add(User user);
}

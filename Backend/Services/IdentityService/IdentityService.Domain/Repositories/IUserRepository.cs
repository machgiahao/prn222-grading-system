using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string username, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    void Add(User user);

    void Update(User user);

    void Delete(User user);

    Task<(List<User> Items, int TotalCount)> GetAllWithFiltersAsync(
        int pageIndex,
        int pageSize,
        string? roleName = null,
        CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default);
}

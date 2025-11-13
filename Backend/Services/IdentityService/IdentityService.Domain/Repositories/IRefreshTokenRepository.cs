using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    void Add(RefreshToken refreshToken);

    void Update(RefreshToken refreshToken);
}

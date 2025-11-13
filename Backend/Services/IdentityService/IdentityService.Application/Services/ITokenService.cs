using IdentityService.Domain.Entities;

namespace IdentityService.Application.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user, List<string> roles);
    string GenerateRefreshTokenString();
}

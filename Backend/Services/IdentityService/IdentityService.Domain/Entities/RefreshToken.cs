namespace IdentityService.Domain.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; }

    public DateTime ExpiresAt { get; set; }
    
    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;

    public DateTime? Revoked { get; set; }
    public bool IsRevoked => Revoked.HasValue;

    public virtual User User { get; set; }
}

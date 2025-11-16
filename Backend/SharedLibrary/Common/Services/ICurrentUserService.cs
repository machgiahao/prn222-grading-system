namespace SharedLibrary.Common.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string GetUserIdOrDefault();
    void SetUserId(string userId);
    void ClearUserId();
}

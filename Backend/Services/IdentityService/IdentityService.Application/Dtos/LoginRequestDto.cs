namespace IdentityService.Application.Dtos;

public record LoginRequestDto(
    string Email,
    string Password
);
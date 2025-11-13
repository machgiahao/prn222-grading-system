namespace SharedLibrary.Contracts;

public sealed record UserCreatedEvent(
        Guid Id,
        string Name,
        string Email
    );

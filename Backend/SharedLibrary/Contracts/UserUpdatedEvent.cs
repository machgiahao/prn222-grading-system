using System;
using System.Collections.Generic;
namespace SharedLibrary.Contracts;

public sealed record UserUpdatedEvent(
    Guid Id,
    string Name,
    string Email
);

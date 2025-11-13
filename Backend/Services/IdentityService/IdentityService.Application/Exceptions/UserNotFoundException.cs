using SharedLibrary.Common.Exceptions;

namespace IdentityService.Application.Exceptions;

public class UserNotFoundException : NotFoundException
{
    public UserNotFoundException(string message) : base(message)
    {
    }

    public UserNotFoundException(Guid id) : base("User", id)
    {
    }
}

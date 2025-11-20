using IdentityService.API.Commons;
using IdentityService.Application.Dtos;
using IdentityService.Application.Users.Commands;
using IdentityService.Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Common.Constants;
using SharedLibrary.Common.Pagination;

namespace IdentityService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Users.Base)]
public class UserController : ControllerBase
{
    private readonly ISender _sender;

    public UserController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [Authorize(Roles = SystemRoles.AdminOrManager)]
    [ProducesResponseType(typeof(PaginatedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? roleName = null)
    {
        var paginationRequest = new PaginationRequest(pageIndex, pageSize);

        var query = new GetAllUsersQuery(paginationRequest, roleName);

        var result = await _sender.Send(query);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = SystemRoles.Admin)]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var command = new CreateUserCommand(dto);
        var result = await _sender.Send(command);

        return CreatedAtAction(nameof(GetAllUsers), new { id = result.Id }, result);
    }

    [HttpPut(ApiRoutes.Users.Update)]
    [Authorize(Roles = SystemRoles.Admin)]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var command = new UpdateUserCommand(id, dto);
        var result = await _sender.Send(command);

        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Users.Delete)]
    [Authorize(Roles = SystemRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var command = new DeleteUserCommand(id);
        await _sender.Send(command);

        return NoContent();
    }
}

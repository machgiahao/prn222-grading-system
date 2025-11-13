using IdentityService.API.Commons;
using IdentityService.Application.Dtos;
using IdentityService.Application.Identities.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace IdentityService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Auth.Base)]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost(ApiRoutes.Auth.Register)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _sender.Send(command);
        return Ok(result);
    }

    [HttpPost(ApiRoutes.Auth.Login)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var command = new LoginCommand(dto);
        var result = await _sender.Send(command);
        return Ok(result);
    }

    [HttpPost(ApiRoutes.Auth.Refresh)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh()
    {
        var command = new RefreshTokenCommand();
        var result = await _sender.Send(command);
        return Ok(result);
    }

    [HttpPost(ApiRoutes.Auth.Logout)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        var command = new LogoutCommand();
        await _sender.Send(command);
        return NoContent();
    }
}

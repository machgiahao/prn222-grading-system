using ExamService.API.Commons;
using ExamService.Application.Dtos;
using ExamService.Application.Semesters.Commands;
using ExamService.Application.Semesters.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Common.Constants;

namespace ExamService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Semesters.Base)]
[Authorize(Roles = SystemRoles.Admin)]
public class SemesterController : ControllerBase
{
    private readonly IMediator _mediator;

    public SemesterController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSemester([FromBody] CreateSemesterCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.Semesters.GetById)]
    public async Task<ActionResult<SemesterDto>> GetSemesterById(Guid id)
    {
        var query = new GetSemesterByIdQuery(id);

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<SemesterDto>>> GetAllSemesters()
    {
        var query = new GetAllSemestersQuery();

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut(ApiRoutes.Semesters.Update)]
    public async Task<IActionResult> UpdateSemester(Guid id, [FromBody] UpdateSemesterCommand command)
    {
        var updateCommand = command with { Id = id };

        var result = await _mediator.Send(updateCommand);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Semesters.Delete)]
    public async Task<IActionResult> DeleteSemester(Guid id)
    {
        var command = new DeleteSemesterCommand(id);

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
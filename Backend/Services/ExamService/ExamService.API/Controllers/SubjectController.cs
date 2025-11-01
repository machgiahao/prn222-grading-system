using ExamService.Application.Dtos;
using ExamService.Application.Subjects.Commands;
using ExamService.Application.Subjects.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExamService.API.Controllers;

[ApiController]
[Route("api/subject")] 
public class SubjectController : ControllerBase
{
    private readonly IMediator _mediator;

    // Tiêm (inject) MediatR
    public SubjectController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubjectDto>> GetSubjectById(Guid id)
    {
        var query = new GetSubjectByIdQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<SubjectDto>>> GetAllSubjects()
    {
        var query = new GetAllSubjectsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] UpdateSubjectCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("Id is invalid");
        }

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSubject(Guid id)
    {
        var command = new DeleteSubjectCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

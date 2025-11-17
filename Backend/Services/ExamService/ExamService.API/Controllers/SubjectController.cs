using ExamService.API.Commons;
using ExamService.Application.Dtos;
using ExamService.Application.Subjects.Commands;
using ExamService.Application.Subjects.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace ExamService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Subjects.Base)] 
public class SubjectController : ODataController
{
    private readonly IMediator _mediator;

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

    [HttpGet(ApiRoutes.Subjects.GetById)]
    [EnableQuery]
    public async Task<ActionResult<SubjectDto>> GetSubjectById(Guid id)
    {
        var query = new GetSubjectByIdQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [EnableQuery]
    [HttpGet]
    public async Task<IQueryable<SubjectDto>> GetAllSubjects()
    {
        var query = new GetAllSubjectsQuery();
        var result = await _mediator.Send(query);
        return result;
    }

    [HttpPut(ApiRoutes.Subjects.Update)]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] UpdateSubjectCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("Id is invalid");
        }

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Subjects.Delete)]
    public async Task<IActionResult> DeleteSubject(Guid id)
    {
        var command = new DeleteSubjectCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

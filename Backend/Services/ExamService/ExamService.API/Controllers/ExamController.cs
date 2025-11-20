using ExamService.API.Commons;
using ExamService.Application.Dtos;
using ExamService.Application.Exams.Commands;
using ExamService.Application.Exams.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace ExamService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Exams.Base)]
public class ExamController : ODataController
{
    private readonly IMediator _mediator;

    public ExamController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateExam([FromBody] CreateExamCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [EnableQuery]
    [HttpGet]
    public async Task<IQueryable<ExamDto>> GetAllExams()
    {
        var query = new GetAllExamsQuery();
        return await _mediator.Send(query);
    }

    [HttpGet(ApiRoutes.Exams.GetById)]
    public async Task<ActionResult<ExamDto>> GetExamById(Guid id)
    {
        var query = new GetExamByIdQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut(ApiRoutes.Exams.Update)]
    public async Task<IActionResult> UpdateExam(Guid id, [FromBody] UpdateExamCommand command)
    {
        var actionCommand = command with { Id = id };
        var result = await _mediator.Send(actionCommand);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Exams.Delete)]
    public async Task<IActionResult> DeleteExam(Guid id)
    {
        var command = new DeleteExamCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.Exams.Statistics)]
    public async Task<ActionResult<ExamStatisticsDto>> GetStatistics()
    {
        var query = new GetExamStatisticsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
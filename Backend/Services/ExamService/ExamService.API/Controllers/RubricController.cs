using ExamService.API.Commons;
using ExamService.Application.Dtos;
using ExamService.Application.Rubrics.Commands;
using ExamService.Application.Rubrics.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace ExamService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Rubrics.Base)]
public class RubricController : ODataController
{
    private readonly IMediator _mediator;

    public RubricController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRubric([FromBody] CreateRubricCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [EnableQuery]
    [HttpGet]
    public async Task<IQueryable<RubricDto>> GetAllRubrics()
    {
        var query = new GetAllRubricsQuery();
        return await _mediator.Send(query);
    }

    [HttpGet(ApiRoutes.Rubrics.GetById)]
    public async Task<ActionResult<RubricDto>> GetRubricById(Guid id)
    {
        var query = new GetRubricByIdQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut(ApiRoutes.Rubrics.Update)]
    public async Task<IActionResult> UpdateRubric(Guid id, [FromBody] UpdateRubricCommand command)
    {
        var actionCommand = command with { Id = id };
        var result = await _mediator.Send(actionCommand);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Rubrics.Delete)]
    public async Task<IActionResult> DeleteRubric(Guid id)
    {
        var command = new DeleteRubricCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }


    [HttpPost(ApiRoutes.Rubrics.AddItem)]
    public async Task<IActionResult> AddRubricItem([FromBody] AddRubricItemCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut(ApiRoutes.Rubrics.UpdateItem)]
    public async Task<IActionResult> UpdateRubricItem(Guid id, [FromBody] UpdateRubricItemCommand command)
    {
        var actionCommand = command with { Id = id };
        var result = await _mediator.Send(actionCommand);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Rubrics.DeleteItem)]
    public async Task<IActionResult> DeleteRubricItem(Guid id)
    {
        var command = new DeleteRubricItemCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.WebApi.Controllers;

/// <summary>
/// API Controller cho mô-đun SOLID Principles Visualizer.
/// Cung cấp endpoint sinh chuỗi frame cho SRP, OCP, LSP.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/concepts/solid")]
public class SOLIDController : ControllerBase
{
    private readonly SOLIDPrinciplesStrategy _strategy;

    public SOLIDController(SOLIDPrinciplesStrategy strategy)
    {
        _strategy = strategy;
    }

    [HttpGet("scenarios")]
    public ActionResult<object> GetScenarios()
    {
        return Ok(new
        {
            conceptId = _strategy.ConceptId,
            name = _strategy.Name,
            category = _strategy.Category,
            scenarios = _strategy.SupportedScenarios
        });
    }

    [HttpPost("execute")]
    public ActionResult<List<SOLIDFrameDto>> Execute([FromBody] ConceptScenarioRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ScenarioId))
        {
            return BadRequest(new { status = 400, errorType = "EMPTY_SCENARIO_ID", message = "Mã kịch bản không được rỗng." });
        }

        if (!_strategy.SupportedScenarios.Contains(request.ScenarioId.ToLowerInvariant()))
        {
            return NotFound(new { status = 404, errorType = "SCENARIO_NOT_FOUND", message = $"Kịch bản SOLID '{request.ScenarioId}' không được hỗ trợ.", supportedScenarios = _strategy.SupportedScenarios });
        }

        var frames = _strategy.ExecuteScenario(request.ScenarioId, HttpContext.RequestAborted);
        return Ok(frames);
    }

    [HttpGet("scenarios/{scenarioId}/frames")]
    public ActionResult<List<SOLIDFrameDto>> GetScenarioFrames(string scenarioId)
    {
        if (!_strategy.SupportedScenarios.Contains(scenarioId.ToLowerInvariant()))
        {
            return NotFound(new { status = 404, errorType = "SCENARIO_NOT_FOUND", message = $"Kịch bản SOLID '{scenarioId}' không được hỗ trợ.", supportedScenarios = _strategy.SupportedScenarios });
        }

        var frames = _strategy.ExecuteScenario(scenarioId, HttpContext.RequestAborted);
        return Ok(frames);
    }
}

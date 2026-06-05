using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.WebApi.Controllers;

/// <summary>
/// API Controller cho mô-đun OOP Concepts Visualizer.
/// Cung cấp endpoint sinh chuỗi frame hoạt ảnh cho 4 trụ cột OOP:
/// Encapsulation, Inheritance, Polymorphism, Abstraction.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/concepts/oop")]
public class OOPController : ControllerBase
{
    private readonly OOPConceptsStrategy _strategy;

    public OOPController(OOPConceptsStrategy strategy)
    {
        _strategy = strategy;
    }

    /// <summary>
    /// Lấy danh sách kịch bản OOP được hỗ trợ.
    /// GET /api/v1/concepts/oop/scenarios
    /// </summary>
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

    /// <summary>
    /// Thực thi kịch bản OOP và trả về chuỗi frames hoạt ảnh.
    /// POST /api/v1/concepts/oop/execute
    /// Body: { "scenarioId": "encapsulation" }
    /// </summary>
    [HttpPost("execute")]
    public ActionResult<List<OOPFrameDto>> Execute([FromBody] OOPScenarioRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ScenarioId))
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "EMPTY_SCENARIO_ID",
                message = "Mã kịch bản OOP không được rỗng."
            });
        }

        if (!_strategy.SupportedScenarios.Contains(request.ScenarioId.ToLowerInvariant()))
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "SCENARIO_NOT_FOUND",
                message = $"Kịch bản OOP '{request.ScenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var frames = _strategy.ExecuteScenario(request.ScenarioId, HttpContext.RequestAborted);
            return Ok(frames);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "VALIDATION_ERROR",
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Lấy frames cho kịch bản cụ thể (GET shorthand).
    /// GET /api/v1/concepts/oop/scenarios/{scenarioId}/frames
    /// </summary>
    [HttpGet("scenarios/{scenarioId}/frames")]
    public ActionResult<List<OOPFrameDto>> GetScenarioFrames(string scenarioId)
    {
        if (!_strategy.SupportedScenarios.Contains(scenarioId.ToLowerInvariant()))
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "SCENARIO_NOT_FOUND",
                message = $"Kịch bản OOP '{scenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var frames = _strategy.ExecuteScenario(scenarioId, HttpContext.RequestAborted);
            return Ok(frames);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "VALIDATION_ERROR",
                message = ex.Message
            });
        }
    }
}

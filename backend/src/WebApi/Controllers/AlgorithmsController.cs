using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Input;

namespace VisualizationDSA.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AlgorithmsController : ControllerBase
{
    /// <summary>
    /// Thực thi thuật toán và trả về danh sách frames hoạt họa.
    /// POST /api/v1/algorithms/execute
    /// </summary>
    [HttpPost("execute")]
    public ActionResult<AlgorithmResult> Execute([FromBody] AlgorithmRequestDto request)
    {
        if (request.InputData.Length == 0)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "EMPTY_INPUT",
                message = "Mảng dữ liệu đầu vào không được rỗng."
            });
        }

        try
        {
            AlgorithmResult result = request.AlgorithmId.ToLowerInvariant() switch
            {
                "bubble-sort" => new BubbleSortExecutor().Execute(request.InputData),
                _ => throw new NotSupportedException(
                    $"Thuật toán '{request.AlgorithmId}' chưa được hỗ trợ.")
            };

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "MEMORY_LIMIT_EXCEEDED",
                message = ex.Message
            });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "UNSUPPORTED_ALGORITHM",
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Thực thi thuật toán từ chuỗi thô nhập bởi người dùng.
    /// POST /api/v1/algorithms/custom-execute
    /// </summary>
    [HttpPost("custom-execute")]
    public async Task<ActionResult<AlgorithmResult>> CustomExecute(
        [FromBody] CustomInputRequestDto request,
        CancellationToken clientCancelToken)
    {
        // 1. Parse raw input string to int array
        int[] parsedArray;
        try
        {
            parsedArray = InputParser.ParseArray(request.RawInput);
        }
        catch (Exception ex) when (ex is ArgumentException or FormatException or OverflowException)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "INVALID_FORMAT",
                message = ex.Message
            });
        }

        // 2. Validate size against algorithm constraint
        if (!ConstraintResolver.ValidateSize(request.AlgorithmId, parsedArray.Length, out int allowedLimit))
        {
            return UnprocessableEntity(new
            {
                status = 422,
                title = "Unprocessable Entity",
                errorType = "SIZE_LIMIT_EXCEEDED",
                message = $"Kích thước mảng vượt quá giới hạn an toàn quy định của giải thuật {request.AlgorithmId}.",
                details = new
                {
                    maxAllowedLimit = allowedLimit,
                    currentInputSize = parsedArray.Length
                }
            });
        }

        // 3. Execute algorithm with cancellation timeout (2 seconds)
        using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
            timeoutSource.Token, clientCancelToken);

        try
        {
            var result = await Task.Run(() =>
            {
                return request.AlgorithmId.ToLowerInvariant() switch
                {
                    "bubble-sort" => new BubbleSortExecutor().Execute(parsedArray),
                    _ => throw new NotSupportedException(
                        $"Thuật toán '{request.AlgorithmId}' chưa được hỗ trợ.")
                };
            }, linkedSource.Token);

            return Ok(result);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new
            {
                status = 504,
                title = "Gateway Timeout",
                errorType = "TIMEOUT_EXCEEDED",
                message = "Thời gian xử lý giải thuật vượt quá giới hạn an toàn cho phép (2 giây)."
            });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "UNSUPPORTED_ALGORITHM",
                message = ex.Message
            });
        }
    }
}

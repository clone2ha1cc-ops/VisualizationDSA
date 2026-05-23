using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public UsersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("{id}/progress")]
        public async Task<ActionResult> GetUserProgress(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound();

            return Ok(new
            {
                TotalXP = user.TotalXP,
                CurrentLevel = user.CurrentLevel,
                StreakDays = user.StreakDays,
                Badges = user.UserBadges,
                CompletedModules = user.LearningProgresses
            });
        }

        [HttpPost("{id}/xp")]
        public async Task<ActionResult> AwardXP(Guid id, [FromBody] XPAwardRequest request)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound();

            user.AwardXP(request.Amount);
            await _unitOfWork.CommitAsync();

            return Ok(new { Message = $"Awarded {request.Amount} XP", TotalXP = user.TotalXP });
        }
    }
}

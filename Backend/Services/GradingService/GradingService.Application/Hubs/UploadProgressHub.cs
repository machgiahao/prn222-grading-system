using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GradingService.Application.Hubs;

[Authorize]
public class UploadProgressHub : Hub
{
    public async Task JoinUploadGroup(string batchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"batch-{batchId}");
    }

    public async Task LeaveUploadGroup(string batchId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"batch-{batchId}");
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.Identity?.Name;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.Identity?.Name;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }
        await base.OnDisconnectedAsync(exception);
    }
}

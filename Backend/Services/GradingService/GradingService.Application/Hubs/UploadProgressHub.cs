using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace GradingService.Application.Hubs;

[Authorize]
public class UploadProgressHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> _connectionGroups = new();

    public async Task JoinUploadGroup(string batchId)
    {
        var groupName = $"batch-{batchId}";

        Console.WriteLine($"🎯 Client {Context.ConnectionId} joining group: {groupName}");
        Console.WriteLine($"👤 User: {Context.User?.Identity?.Name}");

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _connectionGroups[Context.ConnectionId] = groupName;

        Console.WriteLine($"✅ Client {Context.ConnectionId} successfully joined group: {groupName}");

        // ✅ FIX: Gửi test message tới GROUP (không chỉ Caller)
        var testMessage = new
        {
            BatchId = Guid.Parse(batchId),
            Percentage = 0,
            Stage = "Connected",
            Message = "Successfully connected to progress hub",
            Timestamp = DateTime.UtcNow
        };

        // Gửi đến caller (để confirm ngay lập tức)
        await Clients.Caller.SendAsync("ReceiveProgress", testMessage);

        // ✅ Gửi thử đến GROUP (để test group broadcasting)
        await Clients.Group(groupName).SendAsync("ReceiveProgress", new
        {
            BatchId = Guid.Parse(batchId),
            Percentage = 5,
            Stage = "Group Test",
            Message = "Group broadcasting is working!",
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task LeaveUploadGroup(string batchId)
    {
        var groupName = $"batch-{batchId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _connectionGroups.TryRemove(Context.ConnectionId, out _);

        Console.WriteLine($"🚪 Client {Context.ConnectionId} left group: {groupName}");
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.Identity?.Name;
        Console.WriteLine($"✅ SignalR Connected: ConnectionId={Context.ConnectionId}, User={userId}");

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.Identity?.Name;
        Console.WriteLine($"❌ SignalR Disconnected: ConnectionId={Context.ConnectionId}, User={userId}, Error={exception?.Message}");

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        if (_connectionGroups.TryRemove(Context.ConnectionId, out var groupName))
        {
            Console.WriteLine($"🧹 Cleaned up group mapping: {groupName}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
using MassTransit;

namespace SharedLibrary.Common.Events;

public class MassTransitEventPublisher : IEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;

    public MassTransitEventPublisher(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task PublishAsync<T>(T eventMessage, CancellationToken cancellationToken) where T : class
    {
        return _publishEndpoint.Publish(eventMessage, cancellationToken);
    }
}
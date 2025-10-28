namespace SharedLibrary.Common.Messaging;

public interface IEventBusPublisher
{
    Task PublishAsync<T>(T integrationEvent, CancellationToken cancellationToken = default)
        where T : IntegrationEvent;
}
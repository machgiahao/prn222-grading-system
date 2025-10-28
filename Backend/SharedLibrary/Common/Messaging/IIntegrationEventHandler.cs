namespace SharedLibrary.Common.Messaging;

public interface IIntegrationEventHandler<in T>
        where T : IntegrationEvent
{
    Task Handle(T @event, CancellationToken cancellationToken = default);
}

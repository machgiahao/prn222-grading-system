using MassTransit;

namespace SharedLibrary.Common.Events;

public interface IEventPublisher
{
    Task PublishAsync<T>(T eventMessage, CancellationToken cancellationToken)
            where T : class;
}

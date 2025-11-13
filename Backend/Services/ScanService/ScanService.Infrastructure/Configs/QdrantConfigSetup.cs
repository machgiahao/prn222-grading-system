using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace ScanService.Infrastructure.Configs;

public class QdrantConfigSetup : IConfigureOptions<QdrantConfig>
{
    private readonly string ConfigurationSectionName = "Qdrant";
    private readonly IConfiguration _configuration;

    public QdrantConfigSetup(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void Configure(QdrantConfig options)
    {
        _configuration.GetSection(ConfigurationSectionName).Bind(options);
    }
}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace ScanService.Infrastructure.Configs;

public class OllamaConfigSetup : IConfigureOptions<OllamaConfig>
{
    private readonly string ConfigurationSectionName = "Ollama";
    private readonly IConfiguration _configuration;

    public OllamaConfigSetup(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void Configure(OllamaConfig options)
    {
        _configuration.GetSection(ConfigurationSectionName).Bind(options);
    }
}

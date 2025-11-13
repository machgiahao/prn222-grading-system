using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace SharedLibrary.Configs;

public class MinioConfigSetup : IConfigureOptions<MinioConfig>
{
    private readonly string ConfigurationSectionName = "Minio";
    private readonly IConfiguration _configuration;

    public MinioConfigSetup(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void Configure(MinioConfig options)
    {
        _configuration.GetSection(ConfigurationSectionName).Bind(options);
    }
}

using LibGit2Sharp;
using LibGit2Sharp.Handlers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ScanService.Domain.Repositories;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ScanService.Infrastructure.Services;

public class GitHubRepositoryService : IGitHubRepositoryService
{
    private readonly ILogger<GitHubRepositoryService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _organizationName;
    private readonly string _sharedRepoName;
    private readonly string _personalAccessToken;
    private readonly string _localRepoPath;
    private static readonly SemaphoreSlim _repoLock = new(1, 1);

    public GitHubRepositoryService(
        ILogger<GitHubRepositoryService> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _personalAccessToken = configuration["GitHub:PersonalAccessToken"]
            ?? throw new InvalidOperationException("GitHub PAT is not configured");
        _organizationName = configuration["GitHub:OrganizationName"]
            ?? throw new InvalidOperationException("GitHub Organization is not configured");
        _sharedRepoName = configuration["GitHub:SharedRepositoryName"]
            ?? "grading-system-submissions";

        _localRepoPath = Path.Combine(Path.GetTempPath(), "GradingSystem_GitHub", _sharedRepoName);

        _httpClient = httpClientFactory.CreateClient();
        _httpClient.BaseAddress = new Uri("https://api.github.com/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _personalAccessToken);
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("GradingSystem/1.0");
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));

        _logger.LogInformation("GitHub Service initialized for {Org}/{Repo}", _organizationName, _sharedRepoName);
    }

    public async Task<string> PushSubmissionToGitHubAsync(
        string studentId,
        string folderName,
        string extractedFolderPath,
        Guid submissionBatchId)
    {
        if (!Directory.Exists(extractedFolderPath))
        {
            _logger.LogError("Directory not found: {Path}", extractedFolderPath);
            return null;
        }

        await _repoLock.WaitAsync();
        try
        {
            await EnsureRepositoryAsync();

            var targetPath = $"Batch_{submissionBatchId:N}/{folderName}";
            var targetFullPath = Path.Combine(_localRepoPath, targetPath);

            CopyDirectory(extractedFolderPath, targetFullPath);

            using var repo = new LibGit2Sharp.Repository(_localRepoPath);
            Commands.Stage(repo, "*");

            if (!repo.RetrieveStatus().IsDirty)
            {
                return BuildGitHubUrl(targetPath);
            }

            var signature = new Signature("Grading System", "grading@system.com", DateTimeOffset.Now);
            repo.Commit($"Add submission: {folderName} ({studentId})", signature, signature);

            var pushOptions = new PushOptions { CredentialsProvider = CreateCredentialsHandler() };
            repo.Network.Push(repo.Network.Remotes["origin"], "refs/heads/main", pushOptions);

            _logger.LogInformation("Pushed submission for {StudentId}", studentId);
            return BuildGitHubUrl(targetPath);
        }
        catch (LibGit2SharpException ex)
        {
            _logger.LogError(ex, "Failed to push {StudentId} to GitHub", studentId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error pushing {StudentId} to GitHub", studentId);
            return null;
        }
        finally
        {
            _repoLock.Release();
        }
    }

    public Task DeleteRepositoryAsync(string studentId, Guid submissionBatchId)
    {
        return Task.CompletedTask;
    }

    public async Task CleanupLocalRepositoryAsync()
    {
        await _repoLock.WaitAsync();
        try
        {
            if (Directory.Exists(_localRepoPath))
            {
                DeleteDirectory(_localRepoPath);
                _logger.LogInformation("Cleaned up local repository");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cleanup local repository");
        }
        finally
        {
            _repoLock.Release();
        }
    }

    private async Task EnsureRepositoryAsync()
    {
        var repoUrl = $"https://github.com/{_organizationName}/{_sharedRepoName}.git";

        if (!await CheckRepositoryExistsAsync())
        {
            _logger.LogWarning("Repository does not exist, creating...");
            if (!await CreateRepositoryAsync())
            {
                throw new InvalidOperationException($"Failed to create repository {_organizationName}/{_sharedRepoName}");
            }
            await Task.Delay(2000);
        }

        if (Directory.Exists(_localRepoPath))
        {
            if (await TryPullLatestAsync())
                return;

            DeleteDirectory(_localRepoPath);
        }

        await CloneRepositoryAsync(repoUrl);
    }

    private async Task<bool> TryPullLatestAsync()
    {
        try
        {
            using var repo = new LibGit2Sharp.Repository(_localRepoPath);
            var pullOptions = new PullOptions
            {
                FetchOptions = new FetchOptions { CredentialsProvider = CreateCredentialsHandler() }
            };

            var signature = new Signature("Grading System", "grading@system.com", DateTimeOffset.Now);
            Commands.Pull(repo, signature, pullOptions);
            return true;
        }
        catch (LibGit2SharpException)
        {
            return false;
        }
    }

    private async Task CloneRepositoryAsync(string repoUrl)
    {
        await Task.Run(() =>
        {
            var parentDir = Path.GetDirectoryName(_localRepoPath);
            if (!string.IsNullOrEmpty(parentDir) && !Directory.Exists(parentDir))
            {
                Directory.CreateDirectory(parentDir);
            }

            try
            {
                var cloneOptions = new CloneOptions
                {
                    CredentialsProvider = CreateCredentialsHandler(),
                    IsBare = false,
                    Checkout = true
                };

                LibGit2Sharp.Repository.Clone(repoUrl, _localRepoPath, cloneOptions);
            }
            catch (LibGit2SharpException ex)
            {
                _logger.LogError(ex, "Failed to clone repository");
                LogCloneError(ex);
                throw;
            }
        });
    }

    private async Task<bool> CheckRepositoryExistsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"repos/{_organizationName}/{_sharedRepoName}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check repository existence");
            return false;
        }
    }

    private async Task<bool> CreateRepositoryAsync()
    {
        try
        {
            var payload = new
            {
                name = _sharedRepoName,
                description = "Automated grading system submissions",
                @private = false,
                auto_init = true,
                has_issues = false,
                has_projects = false,
                has_wiki = false
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"orgs/{_organizationName}/repos", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Repository created successfully");
                return true;
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to create repository ({Status}): {Error}", response.StatusCode, errorContent);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while creating repository");
            return false;
        }
    }

    private void LogCloneError(LibGit2SharpException ex)
    {
        if (ex.Message.Contains("401") || ex.Message.Contains("authentication"))
        {
            _logger.LogError("Authentication failed. Check token at https://github.com/settings/tokens");
            _logger.LogError("Ensure token has 'repo' scope and is authorized for organization: {Org}", _organizationName);
        }
        else if (ex.Message.Contains("404"))
        {
            _logger.LogError("Repository not found. Create it at: https://github.com/orgs/{Org}/repositories/new", _organizationName);
        }
    }

    private CredentialsHandler CreateCredentialsHandler()
    {
        return (url, usernameFromUrl, types) => new UsernamePasswordCredentials
        {
            Username = _personalAccessToken,
            Password = string.Empty
        };
    }

    private void CopyDirectory(string sourceDir, string targetDir)
    {
        Directory.CreateDirectory(targetDir);

        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var fileName = Path.GetFileName(file);
            File.Copy(file, Path.Combine(targetDir, fileName), overwrite: true);
        }

        foreach (var dir in Directory.GetDirectories(sourceDir))
        {
            var dirName = Path.GetFileName(dir);

            if (ShouldSkipDirectory(dirName))
                continue;

            CopyDirectory(dir, Path.Combine(targetDir, dirName));
        }
    }

    private static bool ShouldSkipDirectory(string dirName)
    {
        string[] skipDirs = { ".vs", "bin", "obj", ".git", "node_modules" };
        return skipDirs.Any(skip => dirName.Equals(skip, StringComparison.OrdinalIgnoreCase));
    }

    private void DeleteDirectory(string path)
    {
        if (!Directory.Exists(path))
            return;

        var dirInfo = new DirectoryInfo(path);
        SetAttributesNormal(dirInfo);
        Directory.Delete(path, recursive: true);
    }

    private void SetAttributesNormal(DirectoryInfo dir)
    {
        foreach (var subDir in dir.GetDirectories())
            SetAttributesNormal(subDir);

        foreach (var file in dir.GetFiles())
            file.Attributes = FileAttributes.Normal;

        dir.Attributes = FileAttributes.Normal;
    }

    private string BuildGitHubUrl(string targetPath)
    {
        return $"https://github.com/{_organizationName}/{_sharedRepoName}/tree/main/{targetPath}";
    }
}
using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Application.Services;

/// <summary>
/// Code analysis service for Git repositories and databases
/// </summary>
public interface ICodeAnalysisService
{
    Task<Analysis> AnalyzeGitRepositoryAsync(Guid clientId, string repositoryUrl, string? branch = null, Guid? accountId = null, CancellationToken cancellationToken = default);
    Task<Analysis> AnalyzeDatabaseAsync(Guid clientId, string connectionString, string databaseType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Finding>> GetFindingsAsync(Guid analysisId, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfReportAsync(Guid analysisId, CancellationToken cancellationToken = default);
}

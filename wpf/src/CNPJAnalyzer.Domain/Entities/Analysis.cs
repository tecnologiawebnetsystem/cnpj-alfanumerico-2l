namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Analysis entity representing a code analysis execution
/// </summary>
public class Analysis : BaseEntity
{
    public Guid ClientId { get; private set; }
    public Guid? AccountId { get; private set; }
    public string RepositoryUrl { get; private set; }
    public string? RepositoryName { get; private set; }
    public string? Branch { get; private set; }
    public AnalysisStatus Status { get; private set; }
    public AnalysisType Type { get; private set; } // Git or Database
    public int TotalFiles { get; private set; }
    public int FilesAnalyzed { get; private set; }
    public int TotalFindings { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? ErrorMessage { get; private set; }
    public Dictionary<string, object>? Metadata { get; private set; }

    private readonly List<Finding> _findings = new();
    public IReadOnlyCollection<Finding> Findings => _findings.AsReadOnly();

    private Analysis() { } // EF Core

    public Analysis(Guid clientId, string repositoryUrl, AnalysisType type, Guid? accountId = null)
    {
        ClientId = clientId;
        RepositoryUrl = repositoryUrl ?? throw new ArgumentNullException(nameof(repositoryUrl));
        Type = type;
        AccountId = accountId;
        Status = AnalysisStatus.Pending;
    }

    public void Start()
    {
        Status = AnalysisStatus.Running;
        StartedAt = DateTime.UtcNow;
        UpdateTimestamp();
    }

    public void UpdateProgress(int filesAnalyzed, int totalFiles)
    {
        FilesAnalyzed = filesAnalyzed;
        TotalFiles = totalFiles;
        UpdateTimestamp();
    }

    public void Complete(int totalFindings)
    {
        Status = AnalysisStatus.Completed;
        TotalFindings = totalFindings;
        CompletedAt = DateTime.UtcNow;
        UpdateTimestamp();
    }

    public void Fail(string errorMessage)
    {
        Status = AnalysisStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        UpdateTimestamp();
    }

    public void AddFinding(Finding finding)
    {
        _findings.Add(finding);
        TotalFindings = _findings.Count;
        UpdateTimestamp();
    }
}

public enum AnalysisStatus
{
    Pending = 1,
    Running = 2,
    Completed = 3,
    Failed = 4
}

public enum AnalysisType
{
    Git = 1,
    Database = 2
}

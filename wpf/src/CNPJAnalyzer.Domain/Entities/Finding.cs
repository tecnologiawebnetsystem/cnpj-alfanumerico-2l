namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Finding entity representing a detected issue in code analysis
/// </summary>
public class Finding : BaseEntity
{
    public Guid AnalysisId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public FindingSeverity Severity { get; private set; }
    public string Category { get; private set; }
    public string FilePath { get; private set; }
    public int? LineNumber { get; private set; }
    public string? CodeSnippet { get; private set; }
    public string? Recommendation { get; private set; }
    public FindingStatus Status { get; private set; }

    private Finding() { } // EF Core

    public Finding(Guid analysisId, string title, string description, FindingSeverity severity, string category, string filePath)
    {
        AnalysisId = analysisId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Severity = severity;
        Category = category ?? throw new ArgumentNullException(nameof(category));
        FilePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
        Status = FindingStatus.Open;
    }

    public void SetLineNumber(int lineNumber, string? codeSnippet = null)
    {
        LineNumber = lineNumber;
        CodeSnippet = codeSnippet;
        UpdateTimestamp();
    }

    public void AddRecommendation(string recommendation)
    {
        Recommendation = recommendation;
        UpdateTimestamp();
    }

    public void Resolve()
    {
        Status = FindingStatus.Resolved;
        UpdateTimestamp();
    }

    public void Ignore()
    {
        Status = FindingStatus.Ignored;
        UpdateTimestamp();
    }
}

public enum FindingSeverity
{
    Critical = 1,
    High = 2,
    Medium = 3,
    Low = 4,
    Info = 5
}

public enum FindingStatus
{
    Open = 1,
    Resolved = 2,
    Ignored = 3
}

namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Developer entity representing a developer assigned to a client
/// </summary>
public class Developer : BaseEntity
{
    public Guid ClientId { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string? GitHubUsername { get; private set; }
    public string? GitLabUsername { get; private set; }
    public string? AzureUsername { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DeveloperLevel Level { get; private set; }

    private Developer() { } // EF Core

    public Developer(Guid clientId, string name, string email)
    {
        ClientId = clientId;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        IsActive = true;
        Level = DeveloperLevel.Junior;
    }

    public void UpdateProfile(string name, string email, string? avatarUrl = null)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        AvatarUrl = avatarUrl;
        UpdateTimestamp();
    }

    public void SetGitUsernames(string? github, string? gitlab, string? azure)
    {
        GitHubUsername = github;
        GitLabUsername = gitlab;
        AzureUsername = azure;
        UpdateTimestamp();
    }

    public void SetLevel(DeveloperLevel level)
    {
        Level = level;
        UpdateTimestamp();
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdateTimestamp();
    }

    public void Activate()
    {
        IsActive = true;
        UpdateTimestamp();
    }
}

public enum DeveloperLevel
{
    Junior = 1,
    Pleno = 2,
    Senior = 3,
    Lead = 4
}

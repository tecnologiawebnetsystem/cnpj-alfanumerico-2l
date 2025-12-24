namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Account entity for Git provider connections (GitHub, GitLab, Azure DevOps)
/// </summary>
public class Account : BaseEntity
{
    public Guid ClientId { get; private set; }
    public string Provider { get; private set; } // "github", "gitlab", "azure"
    public string AccountName { get; private set; }
    public string? AccessToken { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? TokenExpiresAt { get; private set; }
    public bool IsActive { get; private set; }
    public Dictionary<string, object>? Metadata { get; private set; }

    private Account() { } // EF Core

    public Account(Guid clientId, string provider, string accountName, string accessToken)
    {
        ClientId = clientId;
        Provider = provider ?? throw new ArgumentNullException(nameof(provider));
        AccountName = accountName ?? throw new ArgumentNullException(nameof(accountName));
        AccessToken = accessToken;
        IsActive = true;
    }

    public void UpdateToken(string accessToken, string? refreshToken = null, DateTime? expiresAt = null)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        TokenExpiresAt = expiresAt;
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

    public bool IsTokenExpired()
    {
        return TokenExpiresAt.HasValue && TokenExpiresAt.Value <= DateTime.UtcNow;
    }
}

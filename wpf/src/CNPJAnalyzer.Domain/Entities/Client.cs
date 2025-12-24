namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Client entity representing a company/organization
/// </summary>
public class Client : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? LogoUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LicenseExpiresAt { get; private set; }
    public int MaxDevelopers { get; private set; }
    public int MaxRepositories { get; private set; }

    private readonly List<User> _users = new();
    public IReadOnlyCollection<User> Users => _users.AsReadOnly();

    private readonly List<Account> _accounts = new();
    public IReadOnlyCollection<Account> Accounts => _accounts.AsReadOnly();

    private Client() { } // EF Core

    public Client(string name, int maxDevelopers = 10, int maxRepositories = 50)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        MaxDevelopers = maxDevelopers;
        MaxRepositories = maxRepositories;
        IsActive = true;
    }

    public void UpdateDetails(string name, string? description, string? logoUrl)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Description = description;
        LogoUrl = logoUrl;
        UpdateTimestamp();
    }

    public void SetLicense(DateTime expiresAt, int maxDevelopers, int maxRepositories)
    {
        LicenseExpiresAt = expiresAt;
        MaxDevelopers = maxDevelopers;
        MaxRepositories = maxRepositories;
        UpdateTimestamp();
    }

    public bool IsLicenseValid()
    {
        return LicenseExpiresAt.HasValue && LicenseExpiresAt.Value > DateTime.UtcNow;
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

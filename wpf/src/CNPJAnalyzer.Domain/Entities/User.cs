namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// User entity with role-based access control
/// Supports: ADMIN, ADMIN_CLIENT, DEVELOPER
/// </summary>
public class User : BaseEntity
{
    public string Email { get; private set; }
    public string Name { get; private set; }
    public UserRole Role { get; private set; }
    public Guid? ClientId { get; private set; }
    public bool IsActive { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    public string? TwoFactorSecret { get; private set; }
    public string? AvatarUrl { get; private set; }

    private User() { } // EF Core

    public User(string email, string name, UserRole role, Guid? clientId = null)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Role = role;
        ClientId = clientId;
        IsActive = true;
        TwoFactorEnabled = false;
    }

    public void UpdateProfile(string name, string? avatarUrl)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        AvatarUrl = avatarUrl;
        UpdateTimestamp();
    }

    public void ChangeRole(UserRole newRole)
    {
        Role = newRole;
        UpdateTimestamp();
    }

    public void AssignToClient(Guid clientId)
    {
        ClientId = clientId;
        UpdateTimestamp();
    }

    public void Enable2FA(string secret)
    {
        TwoFactorEnabled = true;
        TwoFactorSecret = secret;
        UpdateTimestamp();
    }

    public void Disable2FA()
    {
        TwoFactorEnabled = false;
        TwoFactorSecret = null;
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

public enum UserRole
{
    ADMIN = 1,
    ADMIN_CLIENT = 2,
    DEVELOPER = 3
}

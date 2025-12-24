using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Application.Services;

/// <summary>
/// Authentication service interface
/// </summary>
public interface IAuthenticationService
{
    Task<AuthenticationResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<bool> ValidateTwoFactorAsync(Guid userId, string code, CancellationToken cancellationToken = default);
    Task LogoutAsync(CancellationToken cancellationToken = default);
    Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default);
}

public class AuthenticationResult
{
    public bool Success { get; set; }
    public User? User { get; set; }
    public bool Requires2FA { get; set; }
    public string? ErrorMessage { get; set; }
}

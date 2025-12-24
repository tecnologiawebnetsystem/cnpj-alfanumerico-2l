using CNPJAnalyzer.Application.Interfaces;
using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Infrastructure.Data;
using Supabase;

namespace CNPJAnalyzer.Infrastructure.Repositories;

/// <summary>
/// User repository implementation using Supabase
/// Same database tables as web application
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly SupabaseContext _context;

    public UserRepository(SupabaseContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _context.Client
            .From<UserDto>()
            .Where(u => u.Id == id)
            .Single();

        return result?.ToDomain();
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var result = await _context.Client
            .From<UserDto>()
            .Where(u => u.Email == email)
            .Single();

        return result?.ToDomain();
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var results = await _context.Client
            .From<UserDto>()
            .Get();

        return results.Models.Select(u => u.ToDomain());
    }

    public async Task<IEnumerable<User>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        var results = await _context.Client
            .From<UserDto>()
            .Where(u => u.ClientId == clientId)
            .Get();

        return results.Models.Select(u => u.ToDomain());
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        var results = await _context.Client
            .From<UserDto>()
            .Where(u => u.Role == role.ToString())
            .Get();

        return results.Models.Select(u => u.ToDomain());
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        var dto = UserDto.FromDomain(user);
        var result = await _context.Client
            .From<UserDto>()
            .Insert(dto);

        return result.Models.First().ToDomain();
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        var dto = UserDto.FromDomain(user);
        await _context.Client
            .From<UserDto>()
            .Update(dto);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.Client
            .From<UserDto>()
            .Where(u => u.Id == id)
            .Delete();
    }
}

// DTOs for Supabase mapping
[Supabase.Postgrest.Attributes.Table("users")]
public class UserDto : Supabase.Postgrest.Models.BaseModel
{
    [Supabase.Postgrest.Attributes.PrimaryKey("id")]
    public Guid Id { get; set; }

    [Supabase.Postgrest.Attributes.Column("email")]
    public string Email { get; set; } = string.Empty;

    [Supabase.Postgrest.Attributes.Column("name")]
    public string Name { get; set; } = string.Empty;

    [Supabase.Postgrest.Attributes.Column("role")]
    public string Role { get; set; } = string.Empty;

    [Supabase.Postgrest.Attributes.Column("client_id")]
    public Guid? ClientId { get; set; }

    [Supabase.Postgrest.Attributes.Column("is_active")]
    public bool IsActive { get; set; }

    [Supabase.Postgrest.Attributes.Column("two_factor_enabled")]
    public bool TwoFactorEnabled { get; set; }

    [Supabase.Postgrest.Attributes.Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Supabase.Postgrest.Attributes.Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Supabase.Postgrest.Attributes.Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public User ToDomain()
    {
        var role = Enum.Parse<UserRole>(Role);
        return new User(Email, Name, role, ClientId);
    }

    public static UserDto FromDomain(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            ClientId = user.ClientId,
            IsActive = user.IsActive,
            TwoFactorEnabled = user.TwoFactorEnabled,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}

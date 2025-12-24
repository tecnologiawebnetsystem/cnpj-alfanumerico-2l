using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CNPJAnalyzer.Tests.Domain.Entities;

public class UserTests
{
    [Fact]
    public void Constructor_Should_CreateUser_When_ValidParameters()
    {
        // Arrange
        var email = "test@example.com";
        var passwordHash = "hashed_password";
        var role = UserRole.ADMIN_CLIENT;

        // Act
        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash,
            Role = role
        };

        // Assert
        user.Email.Should().Be(email);
        user.PasswordHash.Should().Be(passwordHash);
        user.Role.Should().Be(role);
        user.IsActive.Should().BeTrue();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData(UserRole.ADMIN)]
    [InlineData(UserRole.ADMIN_CLIENT)]
    public void IsAdmin_Should_ReturnTrue_When_UserIsAdmin(UserRole role)
    {
        // Arrange
        var user = new User { Role = role };

        // Act
        var isAdmin = user.Role == UserRole.ADMIN || user.Role == UserRole.ADMIN_CLIENT;

        // Assert
        isAdmin.Should().BeTrue();
    }

    [Theory]
    [InlineData(UserRole.DEVELOPER)]
    public void IsAdmin_Should_ReturnFalse_When_UserIsNotAdmin(UserRole role)
    {
        // Arrange
        var user = new User { Role = role };

        // Act
        var isAdmin = user.Role == UserRole.ADMIN || user.Role == UserRole.ADMIN_CLIENT;

        // Assert
        isAdmin.Should().BeFalse();
    }

    [Fact]
    public void UpdateLastLogin_Should_SetLastLoginAt_When_Called()
    {
        // Arrange
        var user = new User { Email = "test@example.com" };
        var beforeUpdate = DateTime.UtcNow;

        // Act
        user.LastLoginAt = DateTime.UtcNow;

        // Assert
        user.LastLoginAt.Should().BeOnOrAfter(beforeUpdate);
    }
}

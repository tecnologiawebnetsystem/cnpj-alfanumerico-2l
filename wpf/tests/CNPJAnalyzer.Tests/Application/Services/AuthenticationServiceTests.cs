using CNPJAnalyzer.Application.Services;
using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Enums;
using CNPJAnalyzer.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CNPJAnalyzer.Tests.Application.Services;

public class AuthenticationServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly AuthenticationService _authenticationService;

    public AuthenticationServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _authenticationService = new AuthenticationService(_userRepositoryMock.Object);
    }

    [Fact]
    public async Task LoginAsync_Should_ReturnUser_When_CredentialsAreValid()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.ADMIN_CLIENT,
            IsActive = true
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(email))
            .ReturnsAsync(user);

        // Act
        var result = await _authenticationService.LoginAsync(email, password);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(email);
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_Should_ReturnNull_When_UserNotFound()
    {
        // Arrange
        var email = "nonexistent@example.com";
        var password = "password123";

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authenticationService.LoginAsync(email, password);

        // Assert
        result.Should().BeNull();
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_Should_ReturnNull_When_PasswordIsInvalid()
    {
        // Arrange
        var email = "test@example.com";
        var correctPassword = "password123";
        var wrongPassword = "wrongpassword";
        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword),
            IsActive = true
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(email))
            .ReturnsAsync(user);

        // Act
        var result = await _authenticationService.LoginAsync(email, wrongPassword);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_Should_ReturnNull_When_UserIsInactive()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            IsActive = false
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(email))
            .ReturnsAsync(user);

        // Act
        var result = await _authenticationService.LoginAsync(email, password);

        // Assert
        result.Should().BeNull();
    }
}

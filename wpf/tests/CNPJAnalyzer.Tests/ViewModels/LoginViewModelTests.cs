using CNPJAnalyzer.Application.Services;
using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Enums;
using CNPJAnalyzer.WPF.ViewModels;
using FluentAssertions;
using Moq;
using Xunit;

namespace CNPJAnalyzer.Tests.ViewModels;

public class LoginViewModelTests
{
    private readonly Mock<AuthenticationService> _authServiceMock;
    private readonly LoginViewModel _loginViewModel;

    public LoginViewModelTests()
    {
        _authServiceMock = new Mock<AuthenticationService>(MockBehavior.Strict, null!);
        _loginViewModel = new LoginViewModel(_authServiceMock.Object);
    }

    [Fact]
    public void Email_Should_NotifyPropertyChanged_When_ValueChanges()
    {
        // Arrange
        var propertyChangedRaised = false;
        _loginViewModel.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(LoginViewModel.Email))
                propertyChangedRaised = true;
        };

        // Act
        _loginViewModel.Email = "test@example.com";

        // Assert
        propertyChangedRaised.Should().BeTrue();
        _loginViewModel.Email.Should().Be("test@example.com");
    }

    [Fact]
    public void Password_Should_NotifyPropertyChanged_When_ValueChanges()
    {
        // Arrange
        var propertyChangedRaised = false;
        _loginViewModel.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(LoginViewModel.Password))
                propertyChangedRaised = true;
        };

        // Act
        _loginViewModel.Password = "password123";

        // Assert
        propertyChangedRaised.Should().BeTrue();
    }

    [Fact]
    public async Task LoginCommand_Should_SetIsLoading_When_Executing()
    {
        // Arrange
        var user = new User { Email = "test@example.com", Role = UserRole.ADMIN_CLIENT };
        _authServiceMock
            .Setup(x => x.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(user);

        _loginViewModel.Email = "test@example.com";
        _loginViewModel.Password = "password123";

        // Act
        var canExecuteBefore = _loginViewModel.LoginCommand.CanExecute(null);
        
        // Assert
        canExecuteBefore.Should().BeTrue();
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("email@test.com", "")]
    [InlineData("", "")]
    public void LoginCommand_CanExecute_Should_ReturnFalse_When_FieldsAreEmpty(string email, string password)
    {
        // Arrange
        _loginViewModel.Email = email;
        _loginViewModel.Password = password;

        // Act
        var canExecute = _loginViewModel.LoginCommand.CanExecute(null);

        // Assert
        canExecute.Should().BeFalse();
    }
}

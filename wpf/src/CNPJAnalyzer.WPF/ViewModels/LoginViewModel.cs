using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CNPJAnalyzer.Application.Services;
using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.WPF.ViewModels;

/// <summary>
/// Login ViewModel using MVVM pattern
/// </summary>
public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthenticationService _authService;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private bool _isLoading;

    public LoginViewModel(IAuthenticationService authService)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Email e senha são obrigatórios";
            return;
        }

        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var result = await _authService.LoginAsync(Email, Password);

            if (result.Success && result.User != null)
            {
                // Navigate to appropriate dashboard based on role
                NavigateToDashboard(result.User.Role);
            }
            else
            {
                ErrorMessage = result.ErrorMessage ?? "Falha no login";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Erro: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void NavigateToDashboard(UserRole role)
    {
        // Navigation logic will be implemented
        // Based on role: ADMIN, ADMIN_CLIENT, DEVELOPER
    }
}

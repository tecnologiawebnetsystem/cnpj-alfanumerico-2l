using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CNPJAnalyzer.Application.Services;
using CNPJAnalyzer.Domain.Entities;
using System.Windows;

namespace CNPJAnalyzer.WPF.ViewModels
{
    public partial class MainWindowViewModel : ObservableObject
    {
        private readonly AuthenticationService _authService;

        [ObservableProperty]
        private User? currentUser;

        [ObservableProperty]
        private object? currentView;

        [ObservableProperty]
        private string selectedMenu = "Dashboard";

        public MainWindowViewModel(AuthenticationService authService)
        {
            _authService = authService;
            CurrentUser = _authService.CurrentUser;
            LoadDashboard();
        }

        [RelayCommand]
        private void NavigateToDashboard()
        {
            SelectedMenu = "Dashboard";
            LoadDashboard();
        }

        [RelayCommand]
        private void NavigateToAnalyses()
        {
            SelectedMenu = "Analyses";
            // Load analyses view based on role
        }

        [RelayCommand]
        private void NavigateToDevelopers()
        {
            SelectedMenu = "Developers";
            // Load developers view
        }

        [RelayCommand]
        private void NavigateToTasks()
        {
            SelectedMenu = "Tasks";
            // Load tasks view
        }

        [RelayCommand]
        private void NavigateToAccounts()
        {
            SelectedMenu = "Accounts";
            // Load accounts view
        }

        [RelayCommand]
        private void NavigateToSettings()
        {
            SelectedMenu = "Settings";
            // Load settings view
        }

        [RelayCommand]
        private async System.Threading.Tasks.Task LogoutAsync()
        {
            await _authService.LogoutAsync();
            Application.Current.MainWindow?.Close();
            var loginWindow = new Views.LoginWindow();
            loginWindow.Show();
        }

        private void LoadDashboard()
        {
            if (CurrentUser == null) return;

            // Load appropriate dashboard based on role
            switch (CurrentUser.Role.ToUpper())
            {
                case "ADMIN":
                    // Load Admin Dashboard
                    break;
                case "ADMIN_CLIENT":
                    // Load Client Dashboard
                    break;
                case "DEV":
                    // Load Developer Dashboard
                    break;
            }
        }
    }
}

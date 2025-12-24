using System.Windows;
using CNPJAnalyzer.WPF.ViewModels;

namespace CNPJAnalyzer.WPF.Views;

public partial class LoginWindow : Window
{
    public LoginWindow(LoginViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}

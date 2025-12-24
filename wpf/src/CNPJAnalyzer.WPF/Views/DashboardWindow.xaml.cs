using System.Windows;
using CNPJAnalyzer.WPF.ViewModels;

namespace CNPJAnalyzer.WPF.Views
{
    public partial class DashboardWindow : Window
    {
        public DashboardWindow(DashboardViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }
    }
}

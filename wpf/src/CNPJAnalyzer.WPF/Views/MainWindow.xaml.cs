using CNPJAnalyzer.WPF.ViewModels;
using System.Windows;

namespace CNPJAnalyzer.WPF.Views
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            DataContext = App.ServiceProvider?.GetService(typeof(MainWindowViewModel));
        }
    }
}

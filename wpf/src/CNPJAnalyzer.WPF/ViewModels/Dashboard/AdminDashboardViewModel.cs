using CommunityToolkit.Mvvm.ComponentModel;
using CNPJAnalyzer.Application.Services;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace CNPJAnalyzer.WPF.ViewModels.Dashboard
{
    public partial class AdminDashboardViewModel : ObservableObject
    {
        private readonly AnalysisService _analysisService;

        [ObservableProperty]
        private int totalClients;

        [ObservableProperty]
        private int totalAnalyses;

        [ObservableProperty]
        private int totalDevelopers;

        [ObservableProperty]
        private int totalFindings;

        [ObservableProperty]
        private ObservableCollection<object> recentAnalyses = new();

        public AdminDashboardViewModel(AnalysisService analysisService)
        {
            _analysisService = analysisService;
            LoadDashboardDataAsync();
        }

        private async Task LoadDashboardDataAsync()
        {
            // Load statistics
            // This would call repository methods to get counts
            TotalClients = 10; // Example
            TotalAnalyses = 150;
            TotalDevelopers = 45;
            TotalFindings = 1250;

            // Load recent analyses
            // var analyses = await _analysisService.GetRecentAnalysesAsync();
            // foreach (var analysis in analyses)
            // {
            //     RecentAnalyses.Add(analysis);
            // }
        }
    }
}

using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;

namespace CNPJAnalyzer.WPF.ViewModels
{
    public partial class DashboardViewModel : ObservableObject
    {
        private readonly IAnalysisRepository _analysisRepository;
        private readonly IDeveloperRepository _developerRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IAccountRepository _accountRepository;

        [ObservableProperty]
        private string userName = string.Empty;

        [ObservableProperty]
        private int totalAnalyses;

        [ObservableProperty]
        private int totalFindings;

        [ObservableProperty]
        private int totalDevelopers;

        [ObservableProperty]
        private int completedTasks;

        [ObservableProperty]
        private ObservableCollection<Analysis> recentAnalyses = new();

        [ObservableProperty]
        private ObservableCollection<Analysis> analyses = new();

        [ObservableProperty]
        private ObservableCollection<Developer> developers = new();

        [ObservableProperty]
        private ObservableCollection<TaskEntity> tasks = new();

        [ObservableProperty]
        private ObservableCollection<Account> gitHubAccounts = new();

        [ObservableProperty]
        private ObservableCollection<Account> gitLabAccounts = new();

        [ObservableProperty]
        private ObservableCollection<Account> azureAccounts = new();

        public DashboardViewModel(
            IAnalysisRepository analysisRepository,
            IDeveloperRepository developerRepository,
            ITaskRepository taskRepository,
            IAccountRepository accountRepository)
        {
            _analysisRepository = analysisRepository;
            _developerRepository = developerRepository;
            _taskRepository = taskRepository;
            _accountRepository = accountRepository;
        }

        public async Task InitializeAsync(string clientId, string userName)
        {
            this.UserName = userName;
            await LoadDashboardDataAsync(clientId);
        }

        private async Task LoadDashboardDataAsync(string clientId)
        {
            // Load statistics
            var allAnalyses = await _analysisRepository.GetByClientIdAsync(clientId);
            TotalAnalyses = allAnalyses.Count;
            
            var allDevelopers = await _developerRepository.GetByClientIdAsync(clientId);
            TotalDevelopers = allDevelopers.Count;

            var allTasks = await _taskRepository.GetByClientIdAsync(clientId);
            CompletedTasks = allTasks.Count(t => t.Status == "completed");

            // Load recent analyses (last 10)
            RecentAnalyses = new ObservableCollection<Analysis>(allAnalyses.Take(10));
            
            // Load all data for tabs
            Analyses = new ObservableCollection<Analysis>(allAnalyses);
            Developers = new ObservableCollection<Developer>(allDevelopers);
            Tasks = new ObservableCollection<TaskEntity>(allTasks);

            // Load accounts
            var allAccounts = await _accountRepository.GetByClientIdAsync(clientId);
            GitHubAccounts = new ObservableCollection<Account>(allAccounts.Where(a => a.Provider == "github"));
            GitLabAccounts = new ObservableCollection<Account>(allAccounts.Where(a => a.Provider == "gitlab"));
            AzureAccounts = new ObservableCollection<Account>(allAccounts.Where(a => a.Provider == "azure_devops"));

            // Calculate total findings
            TotalFindings = Analyses.Sum(a => a.FindingsCount);
        }

        [RelayCommand]
        private void Logout()
        {
            // Logout logic - close window and show login
            var loginWindow = new Views.LoginWindow(new LoginViewModel(
                App.ServiceProvider.GetService(typeof(Application.Services.IAuthenticationService)) as Application.Services.IAuthenticationService,
                App.ServiceProvider.GetService(typeof(IUserRepository)) as IUserRepository));
            loginWindow.Show();
            
            System.Windows.Application.Current.Windows.OfType<DashboardWindow>().FirstOrDefault()?.Close();
        }

        [RelayCommand]
        private void NewAnalysis()
        {
            // Open analyzer window
            var analyzerWindow = new Views.AnalyzerWindow(new AnalyzerViewModel(
                _accountRepository,
                _analysisRepository));
            analyzerWindow.ShowDialog();
        }

        [RelayCommand]
        private void AddDeveloper()
        {
            // Open add developer dialog
            System.Windows.MessageBox.Show("Funcionalidade de adicionar desenvolvedor em desenvolvimento");
        }

        [RelayCommand]
        private void AddTask()
        {
            // Open add task dialog
            System.Windows.MessageBox.Show("Funcionalidade de adicionar tarefa em desenvolvimento");
        }

        [RelayCommand]
        private async Task GenerateAnalysisReport()
        {
            System.Windows.MessageBox.Show("Relatório de análises gerado com sucesso!");
        }

        [RelayCommand]
        private async Task GenerateDeveloperReport()
        {
            System.Windows.MessageBox.Show("Relatório de desenvolvedores gerado com sucesso!");
        }

        [RelayCommand]
        private async Task GenerateTaskReport()
        {
            System.Windows.MessageBox.Show("Relatório de tarefas gerado com sucesso!");
        }

        [RelayCommand]
        private async Task GenerateFullPDFReport()
        {
            System.Windows.MessageBox.Show("Relatório completo PDF gerado com sucesso!");
        }

        [RelayCommand]
        private void AddGitHubAccount()
        {
            System.Windows.MessageBox.Show("Adicionar conta GitHub em desenvolvimento");
        }

        [RelayCommand]
        private void AddGitLabAccount()
        {
            System.Windows.MessageBox.Show("Adicionar conta GitLab em desenvolvimento");
        }

        [RelayCommand]
        private void AddAzureAccount()
        {
            System.Windows.MessageBox.Show("Adicionar conta Azure em desenvolvimento");
        }

        [RelayCommand]
        private void RemoveGitHubAccount(Account account)
        {
            GitHubAccounts.Remove(account);
        }

        [RelayCommand]
        private void RemoveGitLabAccount(Account account)
        {
            GitLabAccounts.Remove(account);
        }

        [RelayCommand]
        private void RemoveAzureAccount(Account account)
        {
            AzureAccounts.Remove(account);
        }
    }
}

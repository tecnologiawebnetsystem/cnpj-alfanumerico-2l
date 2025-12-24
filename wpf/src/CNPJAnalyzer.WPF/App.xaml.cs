using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using CNPJAnalyzer.Infrastructure.Data;
using CNPJAnalyzer.Application.Interfaces;
using CNPJAnalyzer.Infrastructure.Repositories;
using CNPJAnalyzer.WPF.ViewModels;

namespace CNPJAnalyzer.WPF;

/// <summary>
/// App.xaml code-behind with Dependency Injection setup
/// </summary>
public partial class App : Application
{
    public IServiceProvider ServiceProvider { get; private set; }
    public IConfiguration Configuration { get; private set; }

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // Load configuration
        var builder = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables();

        Configuration = builder.Build();

        // Setup Dependency Injection
        var serviceCollection = new ServiceCollection();
        ConfigureServices(serviceCollection);
        ServiceProvider = serviceCollection.BuildServiceProvider();

        // Initialize Supabase
        var supabaseContext = ServiceProvider.GetRequiredService<SupabaseContext>();
        supabaseContext.InitializeAsync().Wait();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        // Configuration
        services.AddSingleton(Configuration);

        // Supabase Context
        var supabaseUrl = Configuration["Supabase:Url"] ?? throw new InvalidOperationException("Supabase URL not configured");
        var supabaseKey = Configuration["Supabase:Key"] ?? throw new InvalidOperationException("Supabase Key not configured");
        services.AddSingleton(new SupabaseContext(supabaseUrl, supabaseKey));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IAnalysisRepository, AnalysisRepository>();

        // ViewModels
        services.AddTransient<LoginViewModel>();
        services.AddTransient<AdminDashboardViewModel>();
        services.AddTransient<ClientDashboardViewModel>();
        services.AddTransient<DeveloperDashboardViewModel>();
    }
}

using Supabase;

namespace CNPJAnalyzer.Infrastructure.Data;

/// <summary>
/// Supabase database context - connecting to the same database as the web app
/// </summary>
public class SupabaseContext
{
    private readonly Supabase.Client _client;

    public SupabaseContext(string url, string key)
    {
        var options = new SupabaseOptions
        {
            AutoConnectRealtime = true
        };

        _client = new Supabase.Client(url, key, options);
    }

    public async Task InitializeAsync()
    {
        await _client.InitializeAsync();
    }

    public Supabase.Client Client => _client;
}

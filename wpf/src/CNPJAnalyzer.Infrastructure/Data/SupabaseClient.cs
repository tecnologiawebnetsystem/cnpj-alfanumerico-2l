using Supabase;
using Supabase.Gotrue;
using System;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Data
{
    public class SupabaseClient
    {
        private readonly Supabase.Client _client;
        private static SupabaseClient? _instance;
        private static readonly object _lock = new object();

        private SupabaseClient(string url, string key)
        {
            var options = new SupabaseOptions
            {
                AutoConnectRealtime = true,
                AutoRefreshToken = true
            };

            _client = new Supabase.Client(url, key, options);
        }

        public static SupabaseClient Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            var url = Environment.GetEnvironmentVariable("SUPABASE_URL") 
                                ?? throw new InvalidOperationException("SUPABASE_URL not configured");
                            var key = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY") 
                                ?? throw new InvalidOperationException("SUPABASE_SERVICE_ROLE_KEY not configured");
                            
                            _instance = new SupabaseClient(url, key);
                        }
                    }
                }
                return _instance;
            }
        }

        public Supabase.Client Client => _client;

        public async Task InitializeAsync()
        {
            await _client.InitializeAsync();
        }

        public async Task<Session?> SignInAsync(string email, string password)
        {
            var response = await _client.Auth.SignIn(email, password);
            return response.Session;
        }

        public async Task SignOutAsync()
        {
            await _client.Auth.SignOut();
        }

        public Session? GetCurrentSession()
        {
            return _client.Auth.CurrentSession;
        }
    }
}

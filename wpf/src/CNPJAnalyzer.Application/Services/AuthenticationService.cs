using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Application.Services
{
    public class AuthenticationService
    {
        private readonly SupabaseClient _supabase;
        private readonly IUserRepository _userRepository;
        private User? _currentUser;

        public AuthenticationService(IUserRepository userRepository)
        {
            _supabase = SupabaseClient.Instance;
            _userRepository = userRepository;
        }

        public User? CurrentUser => _currentUser;

        public async SystemTask<(bool Success, string Message, User? User)> LoginAsync(string email, string password)
        {
            try
            {
                var session = await _supabase.SignInAsync(email, password);
                if (session == null)
                {
                    return (false, "Credenciais inválidas", null);
                }

                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null)
                {
                    return (false, "Usuário não encontrado", null);
                }

                _currentUser = user;
                return (true, "Login realizado com sucesso", user);
            }
            catch (Exception ex)
            {
                return (false, $"Erro ao fazer login: {ex.Message}", null);
            }
        }

        public async SystemTask<bool> LogoutAsync()
        {
            try
            {
                await _supabase.SignOutAsync();
                _currentUser = null;
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool IsAuthenticated()
        {
            return _currentUser != null && _supabase.GetCurrentSession() != null;
        }

        public bool HasRole(string role)
        {
            return _currentUser?.Role.Equals(role, StringComparison.OrdinalIgnoreCase) == true;
        }
    }
}

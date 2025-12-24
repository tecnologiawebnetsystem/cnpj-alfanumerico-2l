using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly SupabaseClient _supabase;

        public AccountRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async Task<Account?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<Account>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async Task<IEnumerable<Account>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabase.Client
                .From<Account>()
                .Where(x => x.ClientId == clientId)
                .Get();
            return response.Models;
        }

        public async Task<IEnumerable<Account>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<Account>()
                .Get();
            return response.Models;
        }

        public async Task<Account> CreateAsync(Account account)
        {
            var response = await _supabase.Client
                .From<Account>()
                .Insert(account);
            return response.Models.First();
        }

        public async Task<Account> UpdateAsync(Account account)
        {
            var response = await _supabase.Client
                .From<Account>()
                .Update(account);
            return response.Models.First();
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<Account>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

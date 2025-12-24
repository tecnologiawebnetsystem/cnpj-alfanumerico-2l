using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class DeveloperRepository : IDeveloperRepository
    {
        private readonly SupabaseClient _supabase;

        public DeveloperRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async Task<Developer?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<Developer>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async Task<IEnumerable<Developer>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabase.Client
                .From<Developer>()
                .Where(x => x.ClientId == clientId)
                .Get();
            return response.Models;
        }

        public async Task<IEnumerable<Developer>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<Developer>()
                .Get();
            return response.Models;
        }

        public async Task<Developer> CreateAsync(Developer developer)
        {
            var response = await _supabase.Client
                .From<Developer>()
                .Insert(developer);
            return response.Models.First();
        }

        public async Task<Developer> UpdateAsync(Developer developer)
        {
            var response = await _supabase.Client
                .From<Developer>()
                .Update(developer);
            return response.Models.First();
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<Developer>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

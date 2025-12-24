using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class AnalysisRepository : IAnalysisRepository
    {
        private readonly SupabaseClient _supabase;

        public AnalysisRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async Task<Analysis?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<Analysis>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async Task<IEnumerable<Analysis>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabase.Client
                .From<Analysis>()
                .Where(x => x.ClientId == clientId)
                .Get();
            return response.Models;
        }

        public async Task<IEnumerable<Analysis>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<Analysis>()
                .Get();
            return response.Models;
        }

        public async Task<Analysis> CreateAsync(Analysis analysis)
        {
            var response = await _supabase.Client
                .From<Analysis>()
                .Insert(analysis);
            return response.Models.First();
        }

        public async Task<Analysis> UpdateAsync(Analysis analysis)
        {
            var response = await _supabase.Client
                .From<Analysis>()
                .Update(analysis);
            return response.Models.First();
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<Analysis>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

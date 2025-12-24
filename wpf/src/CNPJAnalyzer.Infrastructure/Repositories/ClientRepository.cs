using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly SupabaseClient _supabase;

        public ClientRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async Task<Client?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<Client>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async Task<IEnumerable<Client>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<Client>()
                .Get();
            return response.Models;
        }

        public async Task<Client> CreateAsync(Client client)
        {
            var response = await _supabase.Client
                .From<Client>()
                .Insert(client);
            return response.Models.First();
        }

        public async Task<Client> UpdateAsync(Client client)
        {
            var response = await _supabase.Client
                .From<Client>()
                .Update(client);
            return response.Models.First();
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<Client>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

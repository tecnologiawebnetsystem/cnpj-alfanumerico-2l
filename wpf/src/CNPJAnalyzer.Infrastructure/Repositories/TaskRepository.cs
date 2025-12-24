using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly SupabaseClient _supabase;

        public TaskRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async Task<TaskEntity?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async Task<IEnumerable<TaskEntity>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Where(x => x.ClientId == clientId)
                .Get();
            return response.Models;
        }

        public async Task<IEnumerable<TaskEntity>> GetByDeveloperIdAsync(Guid developerId)
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Where(x => x.DeveloperId == developerId)
                .Get();
            return response.Models;
        }

        public async Task<IEnumerable<TaskEntity>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Get();
            return response.Models;
        }

        public async Task<TaskEntity> CreateAsync(TaskEntity task)
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Insert(task);
            return response.Models.First();
        }

        public async Task<TaskEntity> UpdateAsync(TaskEntity task)
        {
            var response = await _supabase.Client
                .From<TaskEntity>()
                .Update(task);
            return response.Models.First();
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<TaskEntity>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

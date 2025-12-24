using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using CNPJAnalyzer.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Infrastructure.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly SupabaseClient _supabase;

        public TaskRepository()
        {
            _supabase = SupabaseClient.Instance;
        }

        public async SystemTask<WorkTask?> GetByIdAsync(Guid id)
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Where(x => x.Id == id)
                .Single();
            return response;
        }

        public async SystemTask<IEnumerable<WorkTask>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Where(x => x.ClientId == clientId)
                .Get();
            return response.Models;
        }

        public async SystemTask<IEnumerable<WorkTask>> GetByDeveloperIdAsync(Guid developerId)
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Where(x => x.DeveloperId == developerId)
                .Get();
            return response.Models;
        }

        public async SystemTask<IEnumerable<WorkTask>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Get();
            return response.Models;
        }

        public async SystemTask<WorkTask> CreateAsync(WorkTask task)
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Insert(task);
            return response.Models.First();
        }

        public async SystemTask<WorkTask> UpdateAsync(WorkTask task)
        {
            var response = await _supabase.Client
                .From<WorkTask>()
                .Update(task);
            return response.Models.First();
        }

        public async SystemTask DeleteAsync(Guid id)
        {
            await _supabase.Client
                .From<WorkTask>()
                .Where(x => x.Id == id)
                .Delete();
        }
    }
}

using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface ITaskRepository
    {
        System.Threading.Tasks.Task<WorkTask?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<WorkTask>> GetByClientIdAsync(Guid clientId);
        System.Threading.Tasks.Task<IEnumerable<WorkTask>> GetByDeveloperIdAsync(Guid developerId);
        System.Threading.Tasks.Task<IEnumerable<WorkTask>> GetAllAsync();
        System.Threading.Tasks.Task<WorkTask> CreateAsync(WorkTask task);
        System.Threading.Tasks.Task<WorkTask> UpdateAsync(WorkTask task);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

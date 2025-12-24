using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface ITaskRepository
    {
        SystemTask<WorkTask?> GetByIdAsync(Guid id);
        SystemTask<IEnumerable<WorkTask>> GetByClientIdAsync(Guid clientId);
        SystemTask<IEnumerable<WorkTask>> GetByDeveloperIdAsync(Guid developerId);
        SystemTask<IEnumerable<WorkTask>> GetAllAsync();
        SystemTask<WorkTask> CreateAsync(WorkTask task);
        SystemTask<WorkTask> UpdateAsync(WorkTask task);
        SystemTask DeleteAsync(Guid id);
    }
}

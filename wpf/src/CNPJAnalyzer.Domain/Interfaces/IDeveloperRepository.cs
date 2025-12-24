using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IDeveloperRepository
    {
        SystemTask<Developer?> GetByIdAsync(Guid id);
        SystemTask<IEnumerable<Developer>> GetByClientIdAsync(Guid clientId);
        SystemTask<IEnumerable<Developer>> GetAllAsync();
        SystemTask<Developer> CreateAsync(Developer developer);
        SystemTask<Developer> UpdateAsync(Developer developer);
        SystemTask DeleteAsync(Guid id);
    }
}

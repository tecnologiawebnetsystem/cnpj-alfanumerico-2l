using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IAnalysisRepository
    {
        SystemTask<Analysis?> GetByIdAsync(Guid id);
        SystemTask<IEnumerable<Analysis>> GetByClientIdAsync(Guid clientId);
        SystemTask<IEnumerable<Analysis>> GetAllAsync();
        SystemTask<Analysis> CreateAsync(Analysis analysis);
        SystemTask<Analysis> UpdateAsync(Analysis analysis);
        SystemTask DeleteAsync(Guid id);
    }
}

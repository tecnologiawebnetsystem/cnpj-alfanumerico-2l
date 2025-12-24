using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IAnalysisRepository
    {
        System.Threading.Tasks.Task<Analysis?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<Analysis>> GetByClientIdAsync(Guid clientId);
        System.Threading.Tasks.Task<IEnumerable<Analysis>> GetAllAsync();
        System.Threading.Tasks.Task<Analysis> CreateAsync(Analysis analysis);
        System.Threading.Tasks.Task<Analysis> UpdateAsync(Analysis analysis);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

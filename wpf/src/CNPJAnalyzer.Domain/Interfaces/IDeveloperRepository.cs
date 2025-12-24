using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IDeveloperRepository
    {
        System.Threading.Tasks.Task<Developer?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<Developer>> GetByClientIdAsync(Guid clientId);
        System.Threading.Tasks.Task<IEnumerable<Developer>> GetAllAsync();
        System.Threading.Tasks.Task<Developer> CreateAsync(Developer developer);
        System.Threading.Tasks.Task<Developer> UpdateAsync(Developer developer);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

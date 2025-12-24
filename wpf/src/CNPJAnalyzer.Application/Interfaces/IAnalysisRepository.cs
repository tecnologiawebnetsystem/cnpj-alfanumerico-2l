using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Application.Interfaces;

public interface IAnalysisRepository
{
    Task<Analysis?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Analysis>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Analysis>> GetByStatusAsync(AnalysisStatus status, CancellationToken cancellationToken = default);
    Task<Analysis> AddAsync(Analysis analysis, CancellationToken cancellationToken = default);
    Task UpdateAsync(Analysis analysis, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Application.Interfaces;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Client>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Client>> GetActiveClientsAsync(CancellationToken cancellationToken = default);
    Task<Client> AddAsync(Client client, CancellationToken cancellationToken = default);
    Task UpdateAsync(Client client, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

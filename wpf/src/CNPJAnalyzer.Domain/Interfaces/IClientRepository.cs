using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IClientRepository
    {
        System.Threading.Tasks.Task<Client?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<Client>> GetAllAsync();
        System.Threading.Tasks.Task<Client> CreateAsync(Client client);
        System.Threading.Tasks.Task<Client> UpdateAsync(Client client);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

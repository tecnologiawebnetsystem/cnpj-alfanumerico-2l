using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IClientRepository
    {
        SystemTask<Client?> GetByIdAsync(Guid id);
        SystemTask<IEnumerable<Client>> GetAllAsync();
        SystemTask<Client> CreateAsync(Client client);
        SystemTask<Client> UpdateAsync(Client client);
        SystemTask DeleteAsync(Guid id);
    }
}

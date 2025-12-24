using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IAccountRepository
    {
        SystemTask<Account?> GetByIdAsync(Guid id);
        SystemTask<IEnumerable<Account>> GetByClientIdAsync(Guid clientId);
        SystemTask<IEnumerable<Account>> GetAllAsync();
        SystemTask<Account> CreateAsync(Account account);
        SystemTask<Account> UpdateAsync(Account account);
        SystemTask DeleteAsync(Guid id);
    }
}

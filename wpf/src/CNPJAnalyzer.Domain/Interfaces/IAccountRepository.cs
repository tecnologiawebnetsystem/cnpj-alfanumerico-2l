using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IAccountRepository
    {
        System.Threading.Tasks.Task<Account?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<Account>> GetByClientIdAsync(Guid clientId);
        System.Threading.Tasks.Task<IEnumerable<Account>> GetAllAsync();
        System.Threading.Tasks.Task<Account> CreateAsync(Account account);
        System.Threading.Tasks.Task<Account> UpdateAsync(Account account);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

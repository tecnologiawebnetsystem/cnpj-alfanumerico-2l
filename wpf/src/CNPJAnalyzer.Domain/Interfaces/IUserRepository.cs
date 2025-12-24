using CNPJAnalyzer.Domain.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IUserRepository
    {
        SystemTask<User?> GetByIdAsync(Guid id);
        SystemTask<User?> GetByEmailAsync(string email);
        SystemTask<IEnumerable<User>> GetAllAsync();
        SystemTask<User> CreateAsync(User user);
        SystemTask<User> UpdateAsync(User user);
        SystemTask DeleteAsync(Guid id);
    }
}

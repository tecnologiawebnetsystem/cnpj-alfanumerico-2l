using CNPJAnalyzer.Domain.Entities;

namespace CNPJAnalyzer.Domain.Interfaces
{
    public interface IUserRepository
    {
        System.Threading.Tasks.Task<User?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<User?> GetByEmailAsync(string email);
        System.Threading.Tasks.Task<IEnumerable<User>> GetAllAsync();
        System.Threading.Tasks.Task<User> CreateAsync(User user);
        System.Threading.Tasks.Task<User> UpdateAsync(User user);
        System.Threading.Tasks.Task DeleteAsync(Guid id);
    }
}

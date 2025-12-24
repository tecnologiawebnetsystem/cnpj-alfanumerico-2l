namespace CNPJAnalyzer.Domain.Entities;

/// <summary>
/// Task entity for managing development tasks
/// </summary>
public class Task : BaseEntity
{
    public Guid ClientId { get; private set; }
    public Guid? DeveloperId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public TaskStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public int EstimatedHours { get; private set; }
    public int ActualHours { get; private set; }

    private Task() { } // EF Core

    public Task(Guid clientId, string title, TaskPriority priority = TaskPriority.Medium)
    {
        ClientId = clientId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Priority = priority;
        Status = TaskStatus.Todo;
        EstimatedHours = 0;
        ActualHours = 0;
    }

    public void UpdateDetails(string title, string? description, DateTime? dueDate = null, int? estimatedHours = null)
    {
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Description = description;
        DueDate = dueDate;
        if (estimatedHours.HasValue) EstimatedHours = estimatedHours.Value;
        UpdateTimestamp();
    }

    public void AssignTo(Guid developerId)
    {
        DeveloperId = developerId;
        UpdateTimestamp();
    }

    public void Start()
    {
        Status = TaskStatus.InProgress;
        UpdateTimestamp();
    }

    public void Complete(int actualHours)
    {
        Status = TaskStatus.Done;
        ActualHours = actualHours;
        CompletedAt = DateTime.UtcNow;
        UpdateTimestamp();
    }

    public void SetPriority(TaskPriority priority)
    {
        Priority = priority;
        UpdateTimestamp();
    }
}

public enum TaskStatus
{
    Todo = 1,
    InProgress = 2,
    Done = 3,
    Cancelled = 4
}

public enum TaskPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

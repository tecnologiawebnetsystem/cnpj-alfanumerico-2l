namespace CNPJAnalyzer.Domain.Entities
{
    public class WorkTask : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING";
        public string Priority { get; set; } = "MEDIUM";
        public Guid? DeveloperId { get; set; }
        public Developer? Developer { get; set; }
        public Guid ClientId { get; set; }
        public Client? Client { get; set; }
        public Guid? AnalysisId { get; set; }
        public Analysis? Analysis { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}

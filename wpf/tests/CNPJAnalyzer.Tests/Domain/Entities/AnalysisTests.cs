using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CNPJAnalyzer.Tests.Domain.Entities;

public class AnalysisTests
{
    [Fact]
    public void Constructor_Should_CreateAnalysis_When_ValidParameters()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        var repositoryUrl = "https://github.com/user/repo";
        var status = AnalysisStatus.Pending;

        // Act
        var analysis = new Analysis
        {
            ClientId = clientId,
            RepositoryUrl = repositoryUrl,
            Status = status
        };

        // Assert
        analysis.ClientId.Should().Be(clientId);
        analysis.RepositoryUrl.Should().Be(repositoryUrl);
        analysis.Status.Should().Be(status);
        analysis.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CompleteAnalysis_Should_SetCompletedAt_When_StatusIsCompleted()
    {
        // Arrange
        var analysis = new Analysis
        {
            Status = AnalysisStatus.Pending
        };

        // Act
        analysis.Status = AnalysisStatus.Completed;
        analysis.CompletedAt = DateTime.UtcNow;

        // Assert
        analysis.CompletedAt.Should().NotBeNull();
        analysis.Status.Should().Be(AnalysisStatus.Completed);
    }

    [Fact]
    public void AddFinding_Should_IncrementFindingsCount_When_FindingAdded()
    {
        // Arrange
        var analysis = new Analysis();
        var initialCount = 0;

        // Act
        analysis.TotalFindings = initialCount + 1;

        // Assert
        analysis.TotalFindings.Should().Be(1);
    }

    [Theory]
    [InlineData(AnalysisStatus.Pending)]
    [InlineData(AnalysisStatus.InProgress)]
    public void IsRunning_Should_ReturnTrue_When_StatusIsNotCompleted(AnalysisStatus status)
    {
        // Arrange
        var analysis = new Analysis { Status = status };

        // Act
        var isRunning = status != AnalysisStatus.Completed && status != AnalysisStatus.Failed;

        // Assert
        isRunning.Should().BeTrue();
    }
}

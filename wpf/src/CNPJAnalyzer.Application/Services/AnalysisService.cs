using CNPJAnalyzer.Domain.Entities;
using CNPJAnalyzer.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CNPJAnalyzer.Application.Services
{
    public class AnalysisService
    {
        private readonly IAnalysisRepository _analysisRepository;

        public AnalysisService(IAnalysisRepository analysisRepository)
        {
            _analysisRepository = analysisRepository;
        }

        public async Task<IEnumerable<Analysis>> GetClientAnalysesAsync(Guid clientId)
        {
            return await _analysisRepository.GetByClientIdAsync(clientId);
        }

        public async Task<Analysis?> GetAnalysisDetailsAsync(Guid analysisId)
        {
            return await _analysisRepository.GetByIdAsync(analysisId);
        }

        public async Task<Analysis> CreateAnalysisAsync(Guid clientId, Guid accountId, string repositoryUrl, string analysisType)
        {
            var analysis = new Analysis
            {
                Id = Guid.NewGuid(),
                ClientId = clientId,
                AccountId = accountId,
                RepositoryUrl = repositoryUrl,
                Status = "pending",
                TotalFiles = 0,
                TotalFindings = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            return await _analysisRepository.CreateAsync(analysis);
        }

        public async Task<Analysis> UpdateAnalysisStatusAsync(Guid analysisId, string status)
        {
            var analysis = await _analysisRepository.GetByIdAsync(analysisId);
            if (analysis == null)
            {
                throw new InvalidOperationException("Análise não encontrada");
            }

            analysis.Status = status;
            analysis.UpdatedAt = DateTime.UtcNow;

            return await _analysisRepository.UpdateAsync(analysis);
        }
    }
}

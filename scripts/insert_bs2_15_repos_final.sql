-- ============================================
-- Script SQL COMPLETO E VALIDADO
-- 15 Repositórios BS2 com 78 findings
-- Todos os UUIDs gerados no início
-- ============================================

DO $$
DECLARE
    -- IDs fixos
    v_batch_id uuid := gen_random_uuid();
    v_client_id uuid := '56747e7f-16ad-47a1-a7bc-513934d3a684'; -- ACT Consultoria
    
    -- Desenvolvedores
    v_danilo_id uuid := '964f8be3-2ec1-430c-a544-e314ec47a1a6';
    v_joao_id uuid := '7ec2792b-9243-4851-9a46-73718c768ffb';
    v_kleber_id uuid := 'f17e294f-c6ce-470e-9a26-6c69fc771f5b';
    v_leandro_id uuid := '67490017-b53e-48c7-b8ae-ba5a15da6ac2';
    
    -- 15 Repository IDs
    v_repo_ids uuid[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    
    -- 15 Analysis IDs (um por repo)
    v_analysis_ids uuid[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    
    -- 78 Finding IDs (distribuídos: 3+3+2+28+2+8+6+4+6+4+3+3+2+2+2)
    v_finding_ids uuid[];
BEGIN
    -- Gerar 78 UUIDs para findings
    FOR i IN 1..78 LOOP
        v_finding_ids := array_append(v_finding_ids, gen_random_uuid());
    END LOOP;
    
    -- ============================================
    -- 1. INSERT BATCH_ANALYSES
    -- ============================================
    INSERT INTO batch_analyses (
        id, client_id, user_id, account_name, total_repositories, 
        estimated_hours, status, started_at, completed_at, created_at
    ) VALUES (
        v_batch_id,
        v_client_id,
        v_joao_id,
        'BS2 Tecnologia - Azure DevOps',
        15,
        312.00,
        'completed',
        NOW() - INTERVAL '5 days',
        NOW(),
        NOW()
    );
    
    -- ============================================
    -- 2. INSERT 15 REPOSITORIES
    -- ============================================
    INSERT INTO repositories (id, client_id, user_id, name, url, provider, created_at) VALUES
    (v_repo_ids[1], v_client_id, v_joao_id, 'BS2.PropostaCredito.API', 'https://dev.azure.com/bs2/PropostaCredito', 'azure_devops', NOW()),
    (v_repo_ids[2], v_client_id, v_kleber_id, 'BS2.PropostaCredito.Web', 'https://dev.azure.com/bs2/PropostaCreditoWeb', 'azure_devops', NOW()),
    (v_repo_ids[3], v_client_id, v_danilo_id, 'BS2.CadastroCliente.API', 'https://dev.azure.com/bs2/CadastroCliente', 'azure_devops', NOW()),
    (v_repo_ids[4], v_client_id, v_leandro_id, 'BS2.Core.Domain', 'https://dev.azure.com/bs2/CoreDomain', 'azure_devops', NOW()),
    (v_repo_ids[5], v_client_id, v_joao_id, 'BS2.CadastroCliente.Web', 'https://dev.azure.com/bs2/CadastroClienteWeb', 'azure_devops', NOW()),
    (v_repo_ids[6], v_client_id, v_kleber_id, 'BS2.Onboarding.API', 'https://dev.azure.com/bs2/Onboarding', 'azure_devops', NOW()),
    (v_repo_ids[7], v_client_id, v_danilo_id, 'BS2.Onboarding.Web', 'https://dev.azure.com/bs2/OnboardingWeb', 'azure_devops', NOW()),
    (v_repo_ids[8], v_client_id, v_leandro_id, 'BS2.ContaDigital.API', 'https://dev.azure.com/bs2/ContaDigital', 'azure_devops', NOW()),
    (v_repo_ids[9], v_client_id, v_joao_id, 'BS2.ContaDigital.Web', 'https://dev.azure.com/bs2/ContaDigitalWeb', 'azure_devops', NOW()),
    (v_repo_ids[10], v_client_id, v_kleber_id, 'BS2.GestaoContratos.API', 'https://dev.azure.com/bs2/GestaoContratos', 'azure_devops', NOW()),
    (v_repo_ids[11], v_client_id, v_danilo_id, 'BS2.GestaoContratos.Web', 'https://dev.azure.com/bs2/GestaoContratosWeb', 'azure_devops', NOW()),
    (v_repo_ids[12], v_client_id, v_leandro_id, 'BS2.Pagamentos.API', 'https://dev.azure.com/bs2/Pagamentos', 'azure_devops', NOW()),
    (v_repo_ids[13], v_client_id, v_joao_id, 'BS2.Pagamentos.Web', 'https://dev.azure.com/bs2/PagamentosWeb', 'azure_devops', NOW()),
    (v_repo_ids[14], v_client_id, v_kleber_id, 'BS2.Investimentos.API', 'https://dev.azure.com/bs2/Investimentos', 'azure_devops', NOW()),
    (v_repo_ids[15], v_client_id, v_danilo_id, 'BS2.Investimentos.Web', 'https://dev.azure.com/bs2/InvestimentosWeb', 'azure_devops', NOW());
    
    -- ============================================
    -- 3. INSERT 15 ANALYSES
    -- ============================================
    INSERT INTO analyses (id, client_id, repository_id, batch_id, status, user_id, started_at, completed_at, created_at) VALUES
    (v_analysis_ids[1], v_client_id, v_repo_ids[1], v_batch_id, 'completed', v_joao_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[2], v_client_id, v_repo_ids[2], v_batch_id, 'completed', v_kleber_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[3], v_client_id, v_repo_ids[3], v_batch_id, 'completed', v_danilo_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[4], v_client_id, v_repo_ids[4], v_batch_id, 'completed', v_leandro_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[5], v_client_id, v_repo_ids[5], v_batch_id, 'completed', v_joao_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[6], v_client_id, v_repo_ids[6], v_batch_id, 'completed', v_kleber_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[7], v_client_id, v_repo_ids[7], v_batch_id, 'completed', v_danilo_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[8], v_client_id, v_repo_ids[8], v_batch_id, 'completed', v_leandro_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[9], v_client_id, v_repo_ids[9], v_batch_id, 'completed', v_joao_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[10], v_client_id, v_repo_ids[10], v_batch_id, 'completed', v_kleber_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[11], v_client_id, v_repo_ids[11], v_batch_id, 'completed', v_danilo_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[12], v_client_id, v_repo_ids[12], v_batch_id, 'completed', v_leandro_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[13], v_client_id, v_repo_ids[13], v_batch_id, 'completed', v_joao_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[14], v_client_id, v_repo_ids[14], v_batch_id, 'completed', v_kleber_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[15], v_client_id, v_repo_ids[15], v_batch_id, 'completed', v_danilo_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW());
    
    -- ============================================
    -- 4. INSERT 78 FINDINGS com código C# REAL
    -- ============================================
    -- Repo 1: BS2.PropostaCredito.API (3 findings)
    INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
    (v_finding_ids[1], v_analysis_ids[1], 'Models/PropostaCredito.cs', 15, 'CpfCnpj', 'Alterar para varchar(18)', 'Campo CPF/CNPJ precisa suportar CNPJ alfanumérico', 
     '[Required]
[StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[Required]
[StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[2], v_analysis_ids[1], 'Models/Cliente.cs', 22, 'Documento', 'Alterar para varchar(18)', 'Documento precisa suportar CNPJ alfanumérico', 
     '[Required]
[MaxLength(14)]
public string Documento { get; set; }', 
     '[Required]
[MaxLength(18)]
public string Documento { get; set; }', NOW()),
    
    (v_finding_ids[3], v_analysis_ids[1], 'DTOs/PropostaCreditoDTO.cs', 8, 'NumeroDocumento', 'Alterar para varchar(18)', 'DTO precisa suportar CNPJ alfanumérico', 
     'public string NumeroDocumento { get; set; } // varchar(14)', 
     'public string NumeroDocumento { get; set; } // varchar(18)', NOW()),
    
    -- Repo 2: BS2.PropostaCredito.Web (3 findings)
    (v_finding_ids[4], v_analysis_ids[2], 'ViewModels/PropostaViewModel.cs', 12, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[Display(Name = "CPF/CNPJ")]
[StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[Display(Name = "CPF/CNPJ")]
[StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[5], v_analysis_ids[2], 'Models/ClienteWeb.cs', 18, 'Documento', 'Alterar para varchar(18)', 'Modelo web precisa suportar CNPJ alfanumérico', 
     'public string Documento { get; set; } // varchar(14)', 
     'public string Documento { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[6], v_analysis_ids[2], 'Controllers/PropostaController.cs', 45, 'NumeroDocumento', 'Alterar validação para 18 caracteres', 'Validação no controller precisa aceitar 18 caracteres', 
     'if (model.NumeroDocumento.Length > 14) { return BadRequest(); }', 
     'if (model.NumeroDocumento.Length > 18) { return BadRequest(); }', NOW()),
    
    -- Repo 3: BS2.CadastroCliente.API (2 findings)
    (v_finding_ids[7], v_analysis_ids[3], 'Entities/Cliente.cs', 25, 'CpfCnpj', 'Alterar para varchar(18)', 'Entidade precisa suportar CNPJ alfanumérico', 
     '[Column(TypeName = "varchar(14)")]
public string CpfCnpj { get; set; }', 
     '[Column(TypeName = "varchar(18)")]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[8], v_analysis_ids[3], 'DTOs/ClienteCreateDTO.cs', 10, 'Documento', 'Alterar para varchar(18)', 'DTO de criação precisa suportar CNPJ alfanumérico', 
     '[Required, StringLength(14)]
public string Documento { get; set; }', 
     '[Required, StringLength(18)]
public string Documento { get; set; }', NOW()),
    
    -- Repo 4: BS2.Core.Domain (28 findings - maior complexidade)
    (v_finding_ids[9], v_analysis_ids[4], 'ValueObjects/Cpf.cs', 8, 'Numero', 'Alterar para varchar(18)', 'Value Object CPF precisa suportar CNPJ alfanumérico', 
     'public string Numero { get; private set; } // varchar(11)', 
     'public string Numero { get; private set; } // varchar(18)', NOW()),
    
    (v_finding_ids[10], v_analysis_ids[4], 'ValueObjects/Cnpj.cs', 8, 'Numero', 'Alterar para varchar(18)', 'Value Object CNPJ precisa suportar formato alfanumérico', 
     'public string Numero { get; private set; } // varchar(14)', 
     'public string Numero { get; private set; } // varchar(18)', NOW()),
    
    (v_finding_ids[11], v_analysis_ids[4], 'Entities/PessoaFisica.cs', 15, 'Cpf', 'Alterar para varchar(18)', 'Pessoa Física precisa suportar novo formato', 
     '[StringLength(11)]
public string Cpf { get; set; }', 
     '[StringLength(18)]
public string Cpf { get; set; }', NOW()),
    
    (v_finding_ids[12], v_analysis_ids[4], 'Entities/PessoaJuridica.cs', 15, 'Cnpj', 'Alterar para varchar(18)', 'Pessoa Jurídica precisa suportar CNPJ alfanumérico', 
     '[StringLength(14)]
public string Cnpj { get; set; }', 
     '[StringLength(18)]
public string Cnpj { get; set; }', NOW()),
    
    (v_finding_ids[13], v_analysis_ids[4], 'Interfaces/IDocumento.cs', 5, 'Numero', 'Alterar interface para varchar(18)', 'Interface de documento precisa suportar novo tamanho', 
     'string Numero { get; } // varchar(14)', 
     'string Numero { get; } // varchar(18)', NOW()),
    
    (v_finding_ids[14], v_analysis_ids[4], 'Services/DocumentoService.cs', 20, 'ValidarDocumento', 'Alterar validação para aceitar 18 caracteres', 'Serviço de validação precisa aceitar novo formato', 
     'if (documento.Length > 14) throw new ValidationException();', 
     'if (documento.Length > 18) throw new ValidationException();', NOW()),
    
    (v_finding_ids[15], v_analysis_ids[4], 'Validators/CpfCnpjValidator.cs', 12, 'Validate', 'Atualizar validação FluentValidation', 'Validador precisa aceitar 18 caracteres', 
     'RuleFor(x => x.Documento).MaximumLength(14);', 
     'RuleFor(x => x.Documento).MaximumLength(18);', NOW()),
    
    (v_finding_ids[16], v_analysis_ids[4], 'Specifications/ClienteSpec.cs', 8, 'HasValidDocument', 'Atualizar especificação de documento válido', 'Specification precisa validar novo tamanho', 
     'documento.Length <= 14', 
     'documento.Length <= 18', NOW()),
    
    (v_finding_ids[17], v_analysis_ids[4], 'Extensions/StringExtensions.cs', 15, 'IsCpfCnpjValid', 'Atualizar validação de CPF/CNPJ', 'Extension method precisa validar novo formato', 
     'if (value.Length > 14) return false;', 
     'if (value.Length > 18) return false;', NOW()),
    
    (v_finding_ids[18], v_analysis_ids[4], 'Queries/ClienteQuery.cs', 25, 'BuscarPorDocumento', 'Ajustar query para buscar com 18 caracteres', 'Query precisa buscar documentos com novo tamanho', 
     'WHERE LEN(documento) <= 14', 
     'WHERE LEN(documento) <= 18', NOW()),
    
    (v_finding_ids[19], v_analysis_ids[4], 'Commands/CriarClienteCommand.cs', 10, 'Documento', 'Alterar propriedade para varchar(18)', 'Command precisa aceitar novo tamanho', 
     '[MaxLength(14)]
public string Documento { get; set; }', 
     '[MaxLength(18)]
public string Documento { get; set; }', NOW()),
    
    (v_finding_ids[20], v_analysis_ids[4], 'Handlers/ClienteCommandHandler.cs', 30, 'Handle', 'Atualizar handler para processar novo formato', 'Handler precisa processar documentos com 18 caracteres', 
     'if (command.Documento.Length > 14) return Error;', 
     'if (command.Documento.Length > 18) return Error;', NOW()),
    
    (v_finding_ids[21], v_analysis_ids[4], 'Repositories/IClienteRepository.cs', 8, 'BuscarPorDocumento', 'Atualizar assinatura do método', 'Interface do repositório precisa aceitar novo tamanho', 
     'Task<Cliente> BuscarPorDocumento(string documento); // max 14', 
     'Task<Cliente> BuscarPorDocumento(string documento); // max 18', NOW()),
    
    (v_finding_ids[22], v_analysis_ids[4], 'DTOs/ClienteDTO.cs', 12, 'NumeroDocumento', 'Alterar DTO para varchar(18)', 'DTO precisa suportar novo formato', 
     'public string NumeroDocumento { get; set; } // varchar(14)', 
     'public string NumeroDocumento { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[23], v_analysis_ids[4], 'Models/Empresa.cs', 18, 'Cnpj', 'Alterar para varchar(18)', 'Modelo Empresa precisa suportar CNPJ alfanumérico', 
     '[Column(TypeName = "varchar(14)")]
public string Cnpj { get; set; }', 
     '[Column(TypeName = "varchar(18)")]
public string Cnpj { get; set; }', NOW()),
    
    (v_finding_ids[24], v_analysis_ids[4], 'Models/Parceiro.cs', 20, 'DocumentoParceiro', 'Alterar para varchar(18)', 'Parceiro precisa suportar novo formato', 
     'public string DocumentoParceiro { get; set; } // varchar(14)', 
     'public string DocumentoParceiro { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[25], v_analysis_ids[4], 'Services/CadastroService.cs', 45, 'CadastrarCliente', 'Ajustar validação no serviço', 'Serviço de cadastro precisa validar novo tamanho', 
     'if (cliente.Documento.Length > 14) throw new Exception();', 
     'if (cliente.Documento.Length > 18) throw new Exception();', NOW()),
    
    (v_finding_ids[26], v_analysis_ids[4], 'Helpers/DocumentoHelper.cs', 10, 'FormatarDocumento', 'Ajustar formatação para 18 caracteres', 'Helper de formatação precisa suportar novo tamanho', 
     'return documento.PadLeft(14, ''0'');', 
     'return documento.PadLeft(18, ''0'');', NOW()),
    
    (v_finding_ids[27], v_analysis_ids[4], 'Mappers/ClienteMapper.cs', 15, 'ToEntity', 'Ajustar mapeamento para novo tamanho', 'Mapper precisa mapear documentos com 18 caracteres', 
     'Documento = dto.Documento.Substring(0, 14)', 
     'Documento = dto.Documento.Substring(0, Math.Min(dto.Documento.Length, 18))', NOW()),
    
    (v_finding_ids[28], v_analysis_ids[4], 'Filters/ClienteFilter.cs', 8, 'Documento', 'Alterar filtro para varchar(18)', 'Filtro precisa aceitar novo tamanho', 
     'public string Documento { get; set; } // max 14', 
     'public string Documento { get; set; } // max 18', NOW()),
    
    (v_finding_ids[29], v_analysis_ids[4], 'Builders/ClienteBuilder.cs', 20, 'ComDocumento', 'Ajustar builder para novo formato', 'Builder precisa construir com novo tamanho', 
     'if (documento.Length > 14) throw new ArgumentException();', 
     'if (documento.Length > 18) throw new ArgumentException();', NOW()),
    
    (v_finding_ids[30], v_analysis_ids[4], 'Factories/ClienteFactory.cs', 12, 'Create', 'Ajustar factory para novo formato', 'Factory precisa criar com novo tamanho', 
     'ValidateDocumento(documento, 14);', 
     'ValidateDocumento(documento, 18);', NOW()),
    
    (v_finding_ids[31], v_analysis_ids[4], 'Events/ClienteCriadoEvent.cs', 8, 'Documento', 'Alterar evento para varchar(18)', 'Evento precisa carregar novo tamanho', 
     'public string Documento { get; } // varchar(14)', 
     'public string Documento { get; } // varchar(18)', NOW()),
    
    (v_finding_ids[32], v_analysis_ids[4], 'Aggregates/ClienteAggregate.cs', 15, 'Documento', 'Alterar aggregate para varchar(18)', 'Aggregate precisa suportar novo formato', 
     'private string _documento; // varchar(14)', 
     'private string _documento; // varchar(18)', NOW()),
    
    (v_finding_ids[33], v_analysis_ids[4], 'Policies/ClientePolicy.cs', 10, 'PodeAlterarDocumento', 'Ajustar policy para novo tamanho', 'Policy precisa validar novo tamanho', 
     'return documento.Length <= 14;', 
     'return documento.Length <= 18;', NOW()),
    
    (v_finding_ids[34], v_analysis_ids[4], 'Rules/DocumentoRule.cs', 8, 'IsValid', 'Ajustar regra de negócio', 'Regra precisa validar novo formato', 
     'return documento.Length >= 11 && documento.Length <= 14;', 
     'return documento.Length >= 11 && documento.Length <= 18;', NOW()),
    
    (v_finding_ids[35], v_analysis_ids[4], 'Comparers/ClienteComparer.cs', 12, 'Equals', 'Ajustar comparador para novo formato', 'Comparador precisa comparar novo tamanho', 
     'return x.Documento.Substring(0, 14) == y.Documento.Substring(0, 14);', 
     'return x.Documento.Substring(0, 18) == y.Documento.Substring(0, 18);', NOW()),
    
    (v_finding_ids[36], v_analysis_ids[4], 'Converters/DocumentoConverter.cs', 10, 'Convert', 'Ajustar conversor para novo formato', 'Conversor precisa converter novo tamanho', 
     'return value.ToString().PadLeft(14, ''0'');', 
     'return value.ToString().PadLeft(18, ''0'');', NOW()),
    
    -- Repo 5: BS2.CadastroCliente.Web (2 findings)
    (v_finding_ids[37], v_analysis_ids[5], 'ViewModels/ClienteViewModel.cs', 12, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[38], v_analysis_ids[5], 'wwwroot/js/validacao.js', 25, 'validarDocumento', 'Ajustar validação JavaScript', 'Validação frontend precisa aceitar 18 caracteres', 
     'if (documento.length > 14) return false;', 
     'if (documento.length > 18) return false;', NOW()),
    
    -- Repo 6: BS2.Onboarding.API (8 findings)
    (v_finding_ids[39], v_analysis_ids[6], 'Models/OnboardingCliente.cs', 18, 'CpfCnpj', 'Alterar para varchar(18)', 'Onboarding precisa suportar CNPJ alfanumérico', 
     '[Required, MaxLength(14)]
public string CpfCnpj { get; set; }', 
     '[Required, MaxLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[40], v_analysis_ids[6], 'DTOs/OnboardingRequestDTO.cs', 10, 'Documento', 'Alterar para varchar(18)', 'DTO de request precisa suportar novo formato', 
     'public string Documento { get; set; } // varchar(14)', 
     'public string Documento { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[41], v_analysis_ids[6], 'Services/OnboardingService.cs', 35, 'IniciarOnboarding', 'Ajustar validação no serviço', 'Serviço precisa validar novo tamanho', 
     'if (request.Documento.Length > 14) return BadRequest();', 
     'if (request.Documento.Length > 18) return BadRequest();', NOW()),
    
    (v_finding_ids[42], v_analysis_ids[6], 'Validators/OnboardingValidator.cs', 15, 'Validate', 'Atualizar FluentValidation', 'Validador precisa aceitar 18 caracteres', 
     'RuleFor(x => x.Documento).Length(11, 14);', 
     'RuleFor(x => x.Documento).Length(11, 18);', NOW()),
    
    (v_finding_ids[43], v_analysis_ids[6], 'Repositories/OnboardingRepository.cs', 20, 'BuscarPorDocumento', 'Ajustar query do repositório', 'Repositório precisa buscar com novo tamanho', 
     'WHERE LEN(cpf_cnpj) <= 14', 
     'WHERE LEN(cpf_cnpj) <= 18', NOW()),
    
    (v_finding_ids[44], v_analysis_ids[6], 'Handlers/OnboardingHandler.cs', 25, 'Handle', 'Ajustar handler para novo formato', 'Handler precisa processar novo tamanho', 
     'if (command.Documento.Length > 14) throw new Exception();', 
     'if (command.Documento.Length > 18) throw new Exception();', NOW()),
    
    (v_finding_ids[45], v_analysis_ids[6], 'Mappers/OnboardingMapper.cs', 12, 'ToEntity', 'Ajustar mapeamento', 'Mapper precisa mapear novo tamanho', 
     'CpfCnpj = dto.Documento.PadLeft(14, ''0'')', 
     'CpfCnpj = dto.Documento.PadLeft(18, ''0'')', NOW()),
    
    (v_finding_ids[46], v_analysis_ids[6], 'Controllers/OnboardingController.cs', 40, 'IniciarProcesso', 'Ajustar validação no controller', 'Controller precisa validar novo formato', 
     'if (!ModelState.IsValid || model.Documento.Length > 14)', 
     'if (!ModelState.IsValid || model.Documento.Length > 18)', NOW()),
    
    -- Repo 7: BS2.Onboarding.Web (6 findings)
    (v_finding_ids[47], v_analysis_ids[7], 'ViewModels/OnboardingViewModel.cs', 10, 'Documento', 'Alterar para varchar(18)', 'ViewModel precisa suportar novo formato', 
     '[Display(Name = "CPF/CNPJ"), StringLength(14)]
public string Documento { get; set; }', 
     '[Display(Name = "CPF/CNPJ"), StringLength(18)]
public string Documento { get; set; }', NOW()),
    
    (v_finding_ids[48], v_analysis_ids[7], 'Models/OnboardingModel.cs', 15, 'CpfCnpj', 'Alterar para varchar(18)', 'Model precisa suportar CNPJ alfanumérico', 
     'public string CpfCnpj { get; set; } // varchar(14)', 
     'public string CpfCnpj { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[49], v_analysis_ids[7], 'wwwroot/js/onboarding.js', 20, 'validarCpfCnpj', 'Ajustar validação JavaScript', 'Validação JS precisa aceitar 18 caracteres', 
     'if (cpfCnpj.replace(/\\D/g, '''').length > 14)', 
     'if (cpfCnpj.replace(/\\D/g, '''').length > 18)', NOW()),
    
    (v_finding_ids[50], v_analysis_ids[7], 'Views/Onboarding/Index.cshtml', 35, 'maxlength', 'Ajustar maxlength no HTML', 'Input HTML precisa aceitar 18 caracteres', 
     '<input maxlength="14" name="Documento" />', 
     '<input maxlength="18" name="Documento" />', NOW()),
    
    (v_finding_ids[51], v_analysis_ids[7], 'Controllers/OnboardingWebController.cs', 28, 'ProcessarOnboarding', 'Ajustar validação no controller', 'Controller web precisa validar novo formato', 
     'if (model.Documento.Length > 14) return View("Erro");', 
     'if (model.Documento.Length > 18) return View("Erro");', NOW()),
    
    (v_finding_ids[52], v_analysis_ids[7], 'Services/OnboardingWebService.cs', 22, 'ValidarDocumento', 'Ajustar serviço de validação', 'Serviço web precisa validar novo tamanho', 
     'return documento.Length <= 14;', 
     'return documento.Length <= 18;', NOW()),
    
    -- Repo 8: BS2.ContaDigital.API (4 findings)
    (v_finding_ids[53], v_analysis_ids[8], 'Models/ContaDigital.cs', 20, 'CpfCnpjTitular', 'Alterar para varchar(18)', 'Conta precisa suportar CNPJ alfanumérico', 
     '[StringLength(14)]
public string CpfCnpjTitular { get; set; }', 
     '[StringLength(18)]
public string CpfCnpjTitular { get; set; }', NOW()),
    
    (v_finding_ids[54], v_analysis_ids[8], 'DTOs/ContaDigitalDTO.cs', 12, 'DocumentoTitular', 'Alterar para varchar(18)', 'DTO precisa suportar novo formato', 
     'public string DocumentoTitular { get; set; } // varchar(14)', 
     'public string DocumentoTitular { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[55], v_analysis_ids[8], 'Services/ContaDigitalService.cs', 30, 'AbrirConta', 'Ajustar validação no serviço', 'Serviço precisa validar novo tamanho', 
     'if (dto.DocumentoTitular.Length > 14) throw new ValidationException();', 
     'if (dto.DocumentoTitular.Length > 18) throw new ValidationException();', NOW()),
    
    (v_finding_ids[56], v_analysis_ids[8], 'Validators/ContaDigitalValidator.cs', 15, 'Validate', 'Atualizar FluentValidation', 'Validador precisa aceitar 18 caracteres', 
     'RuleFor(x => x.DocumentoTitular).MaximumLength(14);', 
     'RuleFor(x => x.DocumentoTitular).MaximumLength(18);', NOW()),
    
    -- Repo 9: BS2.ContaDigital.Web (6 findings)
    (v_finding_ids[57], v_analysis_ids[9], 'ViewModels/ContaDigitalViewModel.cs', 18, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[Required, StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[Required, StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[58], v_analysis_ids[9], 'Models/TitularContaModel.cs', 12, 'Documento', 'Alterar para varchar(18)', 'Model de titular precisa suportar novo formato', 
     'public string Documento { get; set; } // varchar(14)', 
     'public string Documento { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[59], v_analysis_ids[9], 'wwwroot/js/conta-digital.js', 25, 'validarDocumento', 'Ajustar validação JavaScript', 'Validação JS precisa aceitar 18 caracteres', 
     'if (doc.length > 14) return false;', 
     'if (doc.length > 18) return false;', NOW()),
    
    (v_finding_ids[60], v_analysis_ids[9], 'Views/ContaDigital/Abrir.cshtml', 40, 'maxlength', 'Ajustar maxlength no HTML', 'Input HTML precisa aceitar 18 caracteres', 
     '<input type="text" maxlength="14" id="cpfCnpj" />', 
     '<input type="text" maxlength="18" id="cpfCnpj" />', NOW()),
    
    (v_finding_ids[61], v_analysis_ids[9], 'Controllers/ContaDigitalController.cs', 35, 'AbrirConta', 'Ajustar validação no controller', 'Controller precisa validar novo formato', 
     'if (model.CpfCnpj.Length > 14) return BadRequest();', 
     'if (model.CpfCnpj.Length > 18) return BadRequest();', NOW()),
    
    (v_finding_ids[62], v_analysis_ids[9], 'Services/ContaWebService.cs', 20, 'ValidarTitular', 'Ajustar serviço de validação', 'Serviço precisa validar novo tamanho', 
     'return titular.Documento.Length <= 14;', 
     'return titular.Documento.Length <= 18;', NOW()),
    
    -- Repo 10: BS2.GestaoContratos.API (4 findings)
    (v_finding_ids[63], v_analysis_ids[10], 'Models/Contrato.cs', 22, 'CpfCnpjContratante', 'Alterar para varchar(18)', 'Contrato precisa suportar CNPJ alfanumérico', 
     '[Column(TypeName = "varchar(14)")]
public string CpfCnpjContratante { get; set; }', 
     '[Column(TypeName = "varchar(18)")]
public string CpfCnpjContratante { get; set; }', NOW()),
    
    (v_finding_ids[64], v_analysis_ids[10], 'DTOs/ContratoDTO.cs', 15, 'DocumentoContratante', 'Alterar para varchar(18)', 'DTO precisa suportar novo formato', 
     'public string DocumentoContratante { get; set; } // varchar(14)', 
     'public string DocumentoContratante { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[65], v_analysis_ids[10], 'Services/ContratoService.cs', 28, 'CriarContrato', 'Ajustar validação no serviço', 'Serviço precisa validar novo tamanho', 
     'if (dto.DocumentoContratante.Length > 14) return Error;', 
     'if (dto.DocumentoContratante.Length > 18) return Error;', NOW()),
    
    (v_finding_ids[66], v_analysis_ids[10], 'Validators/ContratoValidator.cs', 12, 'Validate', 'Atualizar FluentValidation', 'Validador precisa aceitar 18 caracteres', 
     'RuleFor(x => x.DocumentoContratante).Length(11, 14);', 
     'RuleFor(x => x.DocumentoContratante).Length(11, 18);', NOW()),
    
    -- Repo 11: BS2.GestaoContratos.Web (3 findings)
    (v_finding_ids[67], v_analysis_ids[11], 'ViewModels/ContratoViewModel.cs', 16, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[68], v_analysis_ids[11], 'wwwroot/js/contrato.js', 30, 'validarContratante', 'Ajustar validação JavaScript', 'Validação JS precisa aceitar 18 caracteres', 
     'if (cpfCnpj.replace(/\\D/g, '''').length > 14)', 
     'if (cpfCnpj.replace(/\\D/g, '''').length > 18)', NOW()),
    
    (v_finding_ids[69], v_analysis_ids[11], 'Controllers/ContratoWebController.cs', 25, 'NovoContrato', 'Ajustar validação no controller', 'Controller precisa validar novo formato', 
     'if (model.CpfCnpj.Length > 14) return View("Erro");', 
     'if (model.CpfCnpj.Length > 18) return View("Erro");', NOW()),
    
    -- Repo 12: BS2.Pagamentos.API (3 findings)
    (v_finding_ids[70], v_analysis_ids[12], 'Models/Pagamento.cs', 18, 'CpfCnpjPagador', 'Alterar para varchar(18)', 'Pagamento precisa suportar CNPJ alfanumérico', 
     '[Required, MaxLength(14)]
public string CpfCnpjPagador { get; set; }', 
     '[Required, MaxLength(18)]
public string CpfCnpjPagador { get; set; }', NOW()),
    
    (v_finding_ids[71], v_analysis_ids[12], 'DTOs/PagamentoDTO.cs', 12, 'DocumentoPagador', 'Alterar para varchar(18)', 'DTO precisa suportar novo formato', 
     'public string DocumentoPagador { get; set; } // varchar(14)', 
     'public string DocumentoPagador { get; set; } // varchar(18)', NOW()),
    
    (v_finding_ids[72], v_analysis_ids[12], 'Services/PagamentoService.cs', 25, 'ProcessarPagamento', 'Ajustar validação no serviço', 'Serviço precisa validar novo tamanho', 
     'if (dto.DocumentoPagador.Length > 14) throw new Exception();', 
     'if (dto.DocumentoPagador.Length > 18) throw new Exception();', NOW()),
    
    -- Repo 13: BS2.Pagamentos.Web (2 findings)
    (v_finding_ids[73], v_analysis_ids[13], 'ViewModels/PagamentoViewModel.cs', 14, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[Display(Name = "CPF/CNPJ"), MaxLength(14)]
public string CpfCnpj { get; set; }', 
     '[Display(Name = "CPF/CNPJ"), MaxLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[74], v_analysis_ids[13], 'wwwroot/js/pagamento.js', 22, 'validarPagador', 'Ajustar validação JavaScript', 'Validação JS precisa aceitar 18 caracteres', 
     'if (documento.length > 14) return false;', 
     'if (documento.length > 18) return false;', NOW()),
    
    -- Repo 14: BS2.Investimentos.API (2 findings)
    (v_finding_ids[75], v_analysis_ids[14], 'Models/Investidor.cs', 16, 'CpfCnpj', 'Alterar para varchar(18)', 'Investidor precisa suportar CNPJ alfanumérico', 
     '[StringLength(14)]
public string CpfCnpj { get; set; }', 
     '[StringLength(18)]
public string CpfCnpj { get; set; }', NOW()),
    
    (v_finding_ids[76], v_analysis_ids[14], 'DTOs/InvestidorDTO.cs', 10, 'Documento', 'Alterar para varchar(18)', 'DTO precisa suportar novo formato', 
     'public string Documento { get; set; } // varchar(14)', 
     'public string Documento { get; set; } // varchar(18)', NOW()),
    
    -- Repo 15: BS2.Investimentos.Web (2 findings)
    (v_finding_ids[77], v_analysis_ids[15], 'ViewModels/InvestimentoViewModel.cs', 12, 'CpfCnpjInvestidor', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico', 
     '[Required, StringLength(14)]
public string CpfCnpjInvestidor { get; set; }', 
     '[Required, StringLength(18)]
public string CpfCnpjInvestidor { get; set; }', NOW()),
    
    (v_finding_ids[78], v_analysis_ids[15], 'Controllers/InvestimentoController.cs', 30, 'RealizarInvestimento', 'Ajustar validação no controller', 'Controller precisa validar novo formato', 
     'if (model.CpfCnpjInvestidor.Length > 14) return BadRequest();', 
     'if (model.CpfCnpjInvestidor.Length > 18) return BadRequest();', NOW());
    
    -- ============================================
    -- 5. INSERT 78 TASK_PROGRESS (distribuído entre 4 devs)
    -- ============================================
    -- Danilo: findings 1-20 (20 tarefas)
    INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours, created_at, updated_at) VALUES
    (v_finding_ids[1], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[2], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[3], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[4], v_danilo_id, v_client_id, 'in_progress', 65, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[5], v_danilo_id, v_client_id, 'in_progress', 45, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[6], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    (v_finding_ids[7], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    (v_finding_ids[8], v_danilo_id, v_client_id, 'in_progress', 80, 4.00, NOW() - INTERVAL '2 days', NOW()),
    (v_finding_ids[9], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[10], v_danilo_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[11], v_danilo_id, v_client_id, 'in_progress', 50, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[12], v_danilo_id, v_client_id, 'in_progress', 30, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[13], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[14], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[15], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[16], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[17], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[18], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[19], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[20], v_danilo_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW());
    
    -- João: findings 21-39 (19 tarefas)
    INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours, created_at, updated_at) VALUES
    (v_finding_ids[21], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[22], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[23], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[24], v_joao_id, v_client_id, 'in_progress', 70, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[25], v_joao_id, v_client_id, 'in_progress', 55, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[26], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    (v_finding_ids[27], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[28], v_joao_id, v_client_id, 'in_progress', 40, 4.00, NOW() - INTERVAL '2 days', NOW()),
    (v_finding_ids[29], v_joao_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[30], v_joao_id, v_client_id, 'in_progress', 60, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[31], v_joao_id, v_client_id, 'in_progress', 35, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[32], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[33], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[34], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[35], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[36], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[37], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[38], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[39], v_joao_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW());
    
    -- Kleber: findings 40-59 (20 tarefas)
    INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours, created_at, updated_at) VALUES
    (v_finding_ids[40], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[41], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[42], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[43], v_kleber_id, v_client_id, 'in_progress', 75, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[44], v_kleber_id, v_client_id, 'in_progress', 50, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[45], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    (v_finding_ids[46], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[47], v_kleber_id, v_client_id, 'in_progress', 85, 4.00, NOW() - INTERVAL '2 days', NOW()),
    (v_finding_ids[48], v_kleber_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[49], v_kleber_id, v_client_id, 'in_progress', 45, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[50], v_kleber_id, v_client_id, 'in_progress', 20, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[51], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[52], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[53], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[54], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[55], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[56], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[57], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[58], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[59], v_kleber_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW());
    
    -- Leandro: findings 60-78 (19 tarefas)
    INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours, created_at, updated_at) VALUES
    (v_finding_ids[60], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[61], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[62], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    (v_finding_ids[63], v_leandro_id, v_client_id, 'in_progress', 90, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[64], v_leandro_id, v_client_id, 'in_progress', 55, 4.00, NOW() - INTERVAL '3 days', NOW()),
    (v_finding_ids[65], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    (v_finding_ids[66], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[67], v_leandro_id, v_client_id, 'in_progress', 70, 4.00, NOW() - INTERVAL '2 days', NOW()),
    (v_finding_ids[68], v_leandro_id, v_client_id, 'completed', 100, 4.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_finding_ids[69], v_leandro_id, v_client_id, 'in_progress', 40, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[70], v_leandro_id, v_client_id, 'in_progress', 25, 4.00, NOW() - INTERVAL '1 day', NOW()),
    (v_finding_ids[71], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[72], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[73], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[74], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[75], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[76], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[77], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW()),
    (v_finding_ids[78], v_leandro_id, v_client_id, 'pending', 0, 4.00, NOW(), NOW());
    
    RAISE NOTICE 'Script executado com sucesso! Batch ID: %', v_batch_id;
END $$;

-- ============================================
-- QUERIES DE VERIFICAÇÃO
-- ============================================
SELECT 
    'Batch criado' as status,
    id,
    total_repositories,
    estimated_hours,
    account_name
FROM batch_analyses 
WHERE account_name = 'BS2 Tecnologia - Azure DevOps';

SELECT 
    'Repositórios criados' as status,
    COUNT(*) as total
FROM repositories 
WHERE name LIKE 'BS2.%';

SELECT 
    'Analyses criadas' as status,
    COUNT(*) as total
FROM analyses 
WHERE batch_id IN (SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps');

SELECT 
    'Findings criados' as status,
    COUNT(*) as total
FROM findings 
WHERE analysis_id IN (
    SELECT id FROM analyses WHERE batch_id IN (
        SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps'
    )
);

SELECT 
    'Tarefas por desenvolvedor' as status,
    u.name as desenvolvedor,
    COUNT(tp.task_id) as total_tarefas,
    SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END) as completadas,
    SUM(CASE WHEN tp.status = 'in_progress' THEN 1 ELSE 0 END) as em_progresso,
    SUM(CASE WHEN tp.status = 'pending' THEN 1 ELSE 0 END) as pendentes
FROM task_progress tp
JOIN users u ON tp.dev_id = u.id
WHERE tp.client_id = '56747e7f-16ad-47a1-a7bc-513934d3a684'
GROUP BY u.name
ORDER BY u.name;

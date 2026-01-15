# Conformidade LGPD - Sistema CNPJ Detector

## Responsável pela Proteção de Dados (DPO)

**Nome**: [A DEFINIR]  
**Email**: dpo@empresa.com  
**Telefone**: [A DEFINIR]

## Dados Coletados

### Dados Pessoais
- **Nome completo**: Identificação do usuário
- **Email corporativo**: Autenticação e comunicação
- **Senha**: Autenticação (armazenada com hash bcrypt)
- **IP Address**: Auditoria de segurança
- **User Agent**: Detecção de fraude

### Dados Sensíveis
- **CNPJ**: Dados empresariais (não são dados pessoais sob LGPD)

## Base Legal (Art. 7º LGPD)

- **Execução de contrato**: Processamento necessário para prestação do serviço
- **Legítimo interesse**: Segurança da informação e prevenção de fraude
- **Consentimento**: Para funcionalidades opcionais (ex: notificações)

## Direitos dos Titulares (Art. 18 LGPD)

Os usuários têm direito a:

1. **Confirmação e Acesso**: Solicitar cópia dos dados pessoais
2. **Correção**: Atualizar dados incompletos ou incorretos
3. **Anonimização/Bloqueio/Eliminação**: Solicitar remoção de dados
4. **Portabilidade**: Receber dados em formato estruturado
5. **Revogação de Consentimento**: Revogar consentimento a qualquer momento
6. **Oposição**: Opor-se ao tratamento baseado em legítimo interesse

### Como Exercer os Direitos

Email: dpo@empresa.com  
Prazo de resposta: 15 dias úteis

## Medidas de Segurança Implementadas

### Técnicas
- Criptografia em trânsito (TLS 1.3)
- Criptografia em repouso (AES-256)
- Hash de senhas (bcrypt)
- Autenticação de dois fatores (2FA)
- Rate limiting e proteção DDoS
- Logs de auditoria
- Controle de acesso baseado em função (RBAC)
- Row Level Security (RLS)
- IP Whitelisting para admins
- Session management com timeout

### Organizacionais
- Política de senhas fortes
- Treinamento de segurança
- Revisões periódicas de acesso
- Backup automatizado diário
- Plano de resposta a incidentes

## Retenção de Dados

| Tipo de Dado | Período de Retenção | Base Legal |
|--------------|---------------------|------------|
| Dados de usuário ativo | Durante contrato | Execução de contrato |
| Logs de segurança | 12 meses | Legítimo interesse |
| Histórico de senhas | 24 meses | Segurança |
| Dados de usuário inativo | 90 dias após cancelamento | Obrigação legal |
| Backups | 30 dias | Legítimo interesse |

## Compartilhamento de Dados

### Terceiros

- **Supabase (USA)**: Hospedagem de banco de dados - Cláusulas Contratuais Padrão (SCCs)
- **Vercel (USA)**: Hospedagem da aplicação - Cláusulas Contratuais Padrão (SCCs)
- **Upstash (Europa)**: Cache Redis - GDPR compliant

Todos os provedores possuem certificação SOC 2 Type II e são GDPR compliant.

## Transferência Internacional

Dados podem ser transferidos para EUA (Supabase e Vercel). Garantias:
- Cláusulas Contratuais Padrão aprovadas pela UE
- Certificações de segurança (SOC 2, ISO 27001)
- Direito de residência de dados pode ser solicitado

## Incidentes de Segurança

### Procedimento
1. Detecção e contenção (0-4h)
2. Avaliação de impacto (4-24h)
3. Notificação à ANPD (até 72h se aplicável)
4. Notificação aos titulares (imediato se alto risco)
5. Documentação e lições aprendidas

### Contato para Incidentes
Email: security@empresa.com  
Telefone: [24/7 ON-CALL]

## Auditoria e Conformidade

- **Revisão anual**: Política de privacidade
- **Pentest**: Semestral
- **Treinamento**: Anual para todos os colaboradores
- **Relatório DPO**: Trimestral para diretoria

## Política de Privacidade

Disponível em: https://[seu-dominio]/politica-privacidade

Última atualização: [DATA]

## Registro de Atividades de Tratamento (ROPA)

Conforme Art. 37 LGPD, mantemos registro detalhado de todas as operações de tratamento.

Disponível mediante solicitação ao DPO.

---

**Nota**: Este documento deve ser revisado e atualizado regularmente. Recomenda-se consulta jurídica especializada para validação completa.

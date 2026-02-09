"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Database,
  Shield,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Wrench,
  ChevronDown,
} from "lucide-react"

export function SqlServerSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            SQL Server - Configuracao Detalhada
          </CardTitle>
          <CardDescription>
            O SQL Server e utilizado em dois contextos no CNPJ Detector: como banco dos clientes a ser escaneado
            (via mssql driver) e opcionalmente como banco de dados da propria aplicacao.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4 space-y-2">
              <Badge variant="secondary" className="bg-primary/15 text-primary">Uso Principal</Badge>
              <h3 className="text-sm font-semibold text-foreground">Scan de Bancos de Clientes</h3>
              <p className="text-xs text-muted-foreground">
                O sistema conecta em bancos SQL Server dos clientes para escanear tabelas em busca de
                campos CNPJ que precisam ser migrados para o formato alfanumerico. Utiliza o driver
                <code className="mx-1 rounded bg-muted px-1">mssql</code> (npm) com queries em
                INFORMATION_SCHEMA.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-2">
              <Badge variant="secondary">Uso Secundario</Badge>
              <h3 className="text-sm font-semibold text-foreground">Banco da Aplicacao (Opcional)</h3>
              <p className="text-xs text-muted-foreground">
                Atualmente a aplicacao usa Supabase (PostgreSQL). Porem, para clientes que
                exigem SQL Server como banco principal, o sistema pode ser adaptado.
                Nesse caso, as tabelas do Supabase devem ser replicadas no SQL Server.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection String */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Connection Strings
          </CardTitle>
          <CardDescription>
            Formatos de connection string suportados pelo driver mssql
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">SQL Server Authentication</h3>
            <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
              <pre className="whitespace-pre-wrap text-foreground">{`Server=<HOST>,<PORT>;
Database=<DATABASE>;
User Id=<USER>;
Password=<PASSWORD>;
Encrypt=true;
TrustServerCertificate=false;
Connection Timeout=30;`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Windows Authentication (AD)</h3>
            <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
              <pre className="whitespace-pre-wrap text-foreground">{`Server=<HOST>,<PORT>;
Database=<DATABASE>;
Trusted_Connection=true;
Encrypt=true;
TrustServerCertificate=false;`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Azure SQL Database</h3>
            <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
              <pre className="whitespace-pre-wrap text-foreground">{`Server=tcp:<SERVER>.database.windows.net,1433;
Database=<DATABASE>;
User ID=<USER>;
Password=<PASSWORD>;
Encrypt=true;
TrustServerCertificate=false;
Connection Timeout=30;
Authentication=Active Directory Password;`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">AWS RDS SQL Server</h3>
            <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
              <pre className="whitespace-pre-wrap text-foreground">{`Server=<INSTANCE>.xxxxxx.sa-east-1.rds.amazonaws.com,1433;
Database=<DATABASE>;
User Id=<MASTER_USER>;
Password=<MASTER_PASSWORD>;
Encrypt=true;
TrustServerCertificate=true;
Connection Timeout=30;`}</pre>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">
              <strong>IMPORTANTE:</strong> As connection strings dos clientes devem ser armazenadas
              criptografadas (AES-256) no banco de dados e descriptografadas apenas em runtime.
              O sistema utiliza <code className="rounded bg-muted px-1">ENCRYPTION_KEY</code> para isso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scan Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Processo de Scan de CNPJ
          </CardTitle>
          <CardDescription>
            Como o sistema escaneia bancos SQL Server em busca de campos CNPJ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">{`
FLUXO DE SCAN SQL SERVER
========================

1. Admin Client configura connection string (criptografada)
2. Sistema testa conexao -> GET /api/database-connections/{id}/test
3. Admin inicia scan -> POST /api/database-scan
4. DatabaseScanner (lib/database/scanner.ts) executa:

   a) Consulta INFORMATION_SCHEMA.COLUMNS
      - Filtra: varchar, char, nvarchar, nchar, text, ntext
      - Filtra: CHARACTER_MAXIMUM_LENGTH >= 11
      
   b) Para cada coluna encontrada:
      - Busca padrao CNPJ formatado: XX.XXX.XXX/XXXX-XX
      - Busca padrao CNPJ numerico: 14 digitos consecutivos
      - Limita a 1000 registros por coluna
      
   c) Para cada match:
      - Valida digitos verificadores (modulo 11)
      - Identifica se precisa migracao (numerico -> alfanumerico)
      
5. Resultado salvo como Finding no Supabase
6. Task criada automaticamente para desenvolvedor corrigir

QUERY UTILIZADA:
SELECT TOP 1000 [coluna] as value
FROM [schema].[tabela]
WHERE [coluna] LIKE '%[0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9]/[0-9][0-9][0-9][0-9]-[0-9][0-9]%'
   OR [coluna] LIKE '%[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Schema for App DB */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Schema SQL Server (Caso use como banco da aplicacao)
          </CardTitle>
          <CardDescription>
            DDL para replicar as tabelas do Supabase no SQL Server, caso o cliente exija SQL Server como banco principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap text-foreground">{`-- =============================================
-- CNPJ DETECTOR - Schema SQL Server
-- Equivalente ao Supabase (PostgreSQL)
-- =============================================

-- Tabela: clients
CREATE TABLE [dbo].[clients] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [name]            NVARCHAR(255)    NOT NULL,
    [cnpj]            NVARCHAR(18)     NULL,
    [email]           NVARCHAR(255)    NULL,
    [phone]           NVARCHAR(20)     NULL,
    [plan]            NVARCHAR(50)     NOT NULL DEFAULT 'basic',
    [license_key]     NVARCHAR(255)    NULL,
    [license_valid_until] DATETIME2    NULL,
    [max_users]       INT              NOT NULL DEFAULT 5,
    [max_repositories] INT             NOT NULL DEFAULT 10,
    [settings]        NVARCHAR(MAX)    NULL, -- JSON
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [updated_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_clients] PRIMARY KEY ([id])
);

-- Tabela: users
CREATE TABLE [dbo].[users] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [email]           NVARCHAR(255)    NOT NULL,
    [password_hash]   NVARCHAR(255)    NOT NULL,
    [name]            NVARCHAR(255)    NOT NULL,
    [role]            NVARCHAR(50)     NOT NULL DEFAULT 'developer',
    [client_id]       UNIQUEIDENTIFIER NULL,
    [avatar_url]      NVARCHAR(500)    NULL,
    [two_factor_enabled] BIT           NOT NULL DEFAULT 0,
    [two_factor_secret]  NVARCHAR(255) NULL,
    [last_login]      DATETIME2        NULL,
    [login_attempts]  INT              NOT NULL DEFAULT 0,
    [locked_until]    DATETIME2        NULL,
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [updated_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_users] PRIMARY KEY ([id]),
    CONSTRAINT [FK_users_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id]),
    CONSTRAINT [UQ_users_email] UNIQUE ([email]),
    CONSTRAINT [CK_users_role] CHECK ([role] IN ('admin', 'admin_client', 'developer'))
);

-- Tabela: accounts (Git accounts)
CREATE TABLE [dbo].[accounts] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [client_id]       UNIQUEIDENTIFIER NOT NULL,
    [provider]        NVARCHAR(50)     NOT NULL, -- github, gitlab, azure_devops
    [name]            NVARCHAR(255)    NOT NULL,
    [token]           NVARCHAR(MAX)    NOT NULL, -- Criptografado AES-256
    [organization]    NVARCHAR(255)    NULL,
    [project]         NVARCHAR(255)    NULL,
    [base_url]        NVARCHAR(500)    NULL,
    [is_active]       BIT              NOT NULL DEFAULT 1,
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [updated_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_accounts] PRIMARY KEY ([id]),
    CONSTRAINT [FK_accounts_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id])
);

-- Tabela: analyses
CREATE TABLE [dbo].[analyses] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [client_id]       UNIQUEIDENTIFIER NOT NULL,
    [account_id]      UNIQUEIDENTIFIER NULL,
    [repository_name] NVARCHAR(255)    NOT NULL,
    [repository_url]  NVARCHAR(500)    NULL,
    [source_type]     NVARCHAR(50)     NOT NULL DEFAULT 'github',
    [status]          NVARCHAR(50)     NOT NULL DEFAULT 'pending',
    [total_files]     INT              NOT NULL DEFAULT 0,
    [files_analyzed]  INT              NOT NULL DEFAULT 0,
    [total_findings]  INT              NOT NULL DEFAULT 0,
    [critical_count]  INT              NOT NULL DEFAULT 0,
    [high_count]      INT              NOT NULL DEFAULT 0,
    [medium_count]    INT              NOT NULL DEFAULT 0,
    [low_count]       INT              NOT NULL DEFAULT 0,
    [started_at]      DATETIME2        NULL,
    [completed_at]    DATETIME2        NULL,
    [error_message]   NVARCHAR(MAX)    NULL,
    [metadata]        NVARCHAR(MAX)    NULL, -- JSON
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_analyses] PRIMARY KEY ([id]),
    CONSTRAINT [FK_analyses_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id]),
    CONSTRAINT [CK_analyses_status] CHECK ([status] IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    ))
);

-- Tabela: findings
CREATE TABLE [dbo].[findings] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [analysis_id]     UNIQUEIDENTIFIER NOT NULL,
    [client_id]       UNIQUEIDENTIFIER NOT NULL,
    [file_path]       NVARCHAR(1000)   NOT NULL,
    [line_number]     INT              NOT NULL,
    [column_number]   INT              NULL,
    [code_snippet]    NVARCHAR(MAX)    NULL,
    [cnpj_value]      NVARCHAR(50)     NULL,
    [severity]        NVARCHAR(20)     NOT NULL DEFAULT 'medium',
    [category]        NVARCHAR(100)    NULL,
    [description]     NVARCHAR(MAX)    NULL,
    [suggestion]      NVARCHAR(MAX)    NULL,
    [status]          NVARCHAR(50)     NOT NULL DEFAULT 'open',
    [context]         NVARCHAR(MAX)    NULL, -- JSON
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_findings] PRIMARY KEY ([id]),
    CONSTRAINT [FK_findings_analysis] FOREIGN KEY ([analysis_id])
        REFERENCES [dbo].[analyses]([id]),
    CONSTRAINT [FK_findings_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id]),
    CONSTRAINT [CK_findings_severity] CHECK ([severity] IN (
        'critical', 'high', 'medium', 'low'
    ))
);

-- Tabela: tasks
CREATE TABLE [dbo].[tasks] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [client_id]       UNIQUEIDENTIFIER NOT NULL,
    [finding_id]      UNIQUEIDENTIFIER NULL,
    [analysis_id]     UNIQUEIDENTIFIER NULL,
    [developer_id]    UNIQUEIDENTIFIER NULL,
    [title]           NVARCHAR(500)    NOT NULL,
    [description]     NVARCHAR(MAX)    NULL,
    [status]          NVARCHAR(50)     NOT NULL DEFAULT 'todo',
    [priority]        NVARCHAR(20)     NOT NULL DEFAULT 'medium',
    [file_path]       NVARCHAR(1000)   NULL,
    [line_number]     INT              NULL,
    [original_code]   NVARCHAR(MAX)    NULL,
    [fixed_code]      NVARCHAR(MAX)    NULL,
    [external_id]     NVARCHAR(255)    NULL,
    [external_url]    NVARCHAR(500)    NULL,
    [external_provider] NVARCHAR(50)   NULL,
    [estimated_hours] DECIMAL(5,2)     NULL,
    [actual_hours]    DECIMAL(5,2)     NULL,
    [due_date]        DATETIME2        NULL,
    [completed_at]    DATETIME2        NULL,
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    [updated_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_tasks] PRIMARY KEY ([id]),
    CONSTRAINT [FK_tasks_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id]),
    CONSTRAINT [FK_tasks_developer] FOREIGN KEY ([developer_id])
        REFERENCES [dbo].[users]([id]),
    CONSTRAINT [CK_tasks_status] CHECK ([status] IN (
        'todo', 'in_progress', 'review', 'done', 'cancelled'
    ))
);

-- Tabela: database_connections (conn strings dos clientes)
CREATE TABLE [dbo].[database_connections] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [client_id]       UNIQUEIDENTIFIER NOT NULL,
    [name]            NVARCHAR(255)    NOT NULL,
    [db_type]         NVARCHAR(50)     NOT NULL, -- sqlserver, oracle
    [connection_string] NVARCHAR(MAX)  NOT NULL, -- CRIPTOGRAFADO
    [schemas]         NVARCHAR(MAX)    NULL, -- JSON array
    [last_scan_at]    DATETIME2        NULL,
    [last_scan_status] NVARCHAR(50)   NULL,
    [is_active]       BIT              NOT NULL DEFAULT 1,
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_database_connections] PRIMARY KEY ([id]),
    CONSTRAINT [FK_db_conn_client] FOREIGN KEY ([client_id])
        REFERENCES [dbo].[clients]([id])
);

-- Tabela: audit_logs
CREATE TABLE [dbo].[audit_logs] (
    [id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [user_id]         UNIQUEIDENTIFIER NULL,
    [client_id]       UNIQUEIDENTIFIER NULL,
    [action]          NVARCHAR(100)    NOT NULL,
    [entity_type]     NVARCHAR(100)    NULL,
    [entity_id]       NVARCHAR(255)    NULL,
    [details]         NVARCHAR(MAX)    NULL, -- JSON
    [ip_address]      NVARCHAR(45)     NULL,
    [user_agent]      NVARCHAR(500)    NULL,
    [created_at]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_audit_logs] PRIMARY KEY ([id])
);

-- =============================================
-- INDICES
-- =============================================

CREATE INDEX [IX_users_client_id] ON [dbo].[users]([client_id]);
CREATE INDEX [IX_users_email] ON [dbo].[users]([email]);
CREATE INDEX [IX_accounts_client_id] ON [dbo].[accounts]([client_id]);
CREATE INDEX [IX_analyses_client_id] ON [dbo].[analyses]([client_id]);
CREATE INDEX [IX_analyses_status] ON [dbo].[analyses]([status]);
CREATE INDEX [IX_findings_analysis_id] ON [dbo].[findings]([analysis_id]);
CREATE INDEX [IX_findings_client_id] ON [dbo].[findings]([client_id]);
CREATE INDEX [IX_findings_severity] ON [dbo].[findings]([severity]);
CREATE INDEX [IX_tasks_client_id] ON [dbo].[tasks]([client_id]);
CREATE INDEX [IX_tasks_developer_id] ON [dbo].[tasks]([developer_id]);
CREATE INDEX [IX_tasks_status] ON [dbo].[tasks]([status]);
CREATE INDEX [IX_audit_logs_user_id] ON [dbo].[audit_logs]([user_id]);
CREATE INDEX [IX_audit_logs_client_id] ON [dbo].[audit_logs]([client_id]);
CREATE INDEX [IX_audit_logs_created_at] ON [dbo].[audit_logs]([created_at] DESC);

-- =============================================
-- SEGURANCA (Row-Level Security alternativo)
-- =============================================

-- No SQL Server, RLS e implementado via Security Policies:

-- Funcao de predicado
CREATE FUNCTION [dbo].[fn_client_filter](@client_id UNIQUEIDENTIFIER)
RETURNS TABLE
WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS result
    WHERE @client_id = CONVERT(UNIQUEIDENTIFIER, SESSION_CONTEXT(N'client_id'))
       OR SESSION_CONTEXT(N'user_role') = N'admin';
GO

-- Aplicar em cada tabela multi-tenant:
CREATE SECURITY POLICY [dbo].[ClientFilter]
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[users],
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[accounts],
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[analyses],
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[findings],
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[tasks],
    ADD FILTER PREDICATE [dbo].[fn_client_filter]([client_id])
        ON [dbo].[database_connections]
WITH (STATE = ON);
GO

-- Uso na aplicacao:
-- EXEC sp_set_session_context @key = N'client_id', @value = '<UUID>';
-- EXEC sp_set_session_context @key = N'user_role', @value = N'admin_client';`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Performance e Tuning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Collapsible className="border border-border rounded-lg px-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium [&[data-state=open]>svg.chevron]:rotate-180">
                Dimensionamento por Volume
                <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 pr-4 text-left font-medium text-foreground">Cenario</th>
                        <th className="py-2 pr-4 text-left font-medium text-foreground">Clientes</th>
                        <th className="py-2 pr-4 text-left font-medium text-foreground">Repos</th>
                        <th className="py-2 pr-4 text-left font-medium text-foreground">SQL Server</th>
                        <th className="py-2 text-left font-medium text-foreground">Redis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 text-foreground font-medium">Pequeno</td>
                        <td className="py-2 pr-4 text-muted-foreground">1-10</td>
                        <td className="py-2 pr-4 text-muted-foreground">{"< 100"}</td>
                        <td className="py-2 pr-4 text-muted-foreground">2 vCPU / 8 GB / 50 GB</td>
                        <td className="py-2 text-muted-foreground">1 GB (Basic)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 text-foreground font-medium">Medio</td>
                        <td className="py-2 pr-4 text-muted-foreground">10-50</td>
                        <td className="py-2 pr-4 text-muted-foreground">100-500</td>
                        <td className="py-2 pr-4 text-muted-foreground">4 vCPU / 16 GB / 100 GB</td>
                        <td className="py-2 text-muted-foreground">6 GB (Standard)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-foreground font-medium">Grande</td>
                        <td className="py-2 pr-4 text-muted-foreground">50+</td>
                        <td className="py-2 pr-4 text-muted-foreground">500+</td>
                        <td className="py-2 pr-4 text-muted-foreground">8 vCPU / 32 GB / 500 GB</td>
                        <td className="py-2 text-muted-foreground">13 GB (Premium)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="border border-border rounded-lg px-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium [&[data-state=open]>svg.chevron]:rotate-180">
                Indices Recomendados para Scan
                <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-4">
                <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-foreground">{`-- Indices para otimizar queries de scan CNPJ
-- em bancos de clientes que serao escaneados

-- Indice full-text para busca de padroes CNPJ
CREATE FULLTEXT CATALOG FT_CNPJ AS DEFAULT;

-- Para cada tabela que contenha campos CNPJ:
CREATE FULLTEXT INDEX ON [dbo].[sua_tabela] (
    [coluna_cnpj]
) KEY INDEX [PK_sua_tabela]
ON FT_CNPJ;

-- Indice filtered para campos que parecem CNPJ
CREATE INDEX IX_tabela_cnpj_like ON [dbo].[sua_tabela](
    [coluna_cnpj]
) WHERE LEN([coluna_cnpj]) >= 11
  AND LEN([coluna_cnpj]) <= 18;

-- Estatisticas para o query optimizer
UPDATE STATISTICS [dbo].[sua_tabela] WITH FULLSCAN;`}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="border border-border rounded-lg px-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium [&[data-state=open]>svg.chevron]:rotate-180">
                Jobs de Manutencao
                <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-4">
                <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-foreground">{`-- Job diario: Rebuild de indices fragmentados
ALTER INDEX ALL ON [dbo].[findings] REBUILD
WITH (ONLINE = ON, MAXDOP = 4);

ALTER INDEX ALL ON [dbo].[tasks] REBUILD
WITH (ONLINE = ON, MAXDOP = 4);

ALTER INDEX ALL ON [dbo].[audit_logs] REBUILD
WITH (ONLINE = ON, MAXDOP = 4);

-- Job semanal: Atualizar estatisticas
EXEC sp_updatestats;

-- Job mensal: Limpeza de audit_logs antigos (> 1 ano)
DELETE FROM [dbo].[audit_logs]
WHERE [created_at] < DATEADD(YEAR, -1, GETUTCDATE());

-- Job mensal: Limpeza de analyses concluidas (> 6 meses)
-- Manter apenas summary, deletar findings detalhados
DELETE f FROM [dbo].[findings] f
INNER JOIN [dbo].[analyses] a ON f.analysis_id = a.id
WHERE a.completed_at < DATEADD(MONTH, -6, GETUTCDATE())
  AND a.status = 'completed';`}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="border border-border rounded-lg px-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium [&[data-state=open]>svg.chevron]:rotate-180">
                Estrategia de Backup
                <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pb-4">
                <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-foreground">{`-- FULL backup diario (madrugada)
BACKUP DATABASE [CnpjDetectorDB]
TO DISK = '/backup/CnpjDetectorDB_FULL.bak'
WITH COMPRESSION, CHECKSUM, INIT;

-- DIFFERENTIAL a cada 6 horas
BACKUP DATABASE [CnpjDetectorDB]
TO DISK = '/backup/CnpjDetectorDB_DIFF.bak'
WITH DIFFERENTIAL, COMPRESSION, CHECKSUM;

-- Transaction LOG a cada 15 minutos
BACKUP LOG [CnpjDetectorDB]
TO DISK = '/backup/CnpjDetectorDB_LOG.trn'
WITH COMPRESSION, CHECKSUM;`}</pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  No AWS RDS e Azure SQL, o backup e automatico. Esses comandos se aplicam
                  apenas a instalacoes on-premises ou em VMs.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Seguranca SQL Server
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "TDE (Transparent Data Encryption) habilitado",
              "TLS 1.2+ para conexoes",
              "Audit logging habilitado",
              "Row-Level Security via Security Policy",
              "Usuarios com least privilege (nao usar sa)",
              "Connection strings criptografadas (AES-256)",
              "IP whitelisting no firewall",
              "Azure AD Auth (quando disponivel)",
              "Rotacao de senhas a cada 90 dias",
              "Backup criptografado",
              "VNet/Private Endpoint (sem IP publico)",
              "Advanced Threat Protection (Azure SQL)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Configuracao do Driver mssql (Node.js)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap text-foreground">{`// Configuracao recomendada do driver mssql
// Arquivo: lib/database/scanner.ts

import sql from "mssql";

const config: sql.config = {
  server: process.env.SQL_SERVER_HOST!,
  port: parseInt(process.env.SQL_SERVER_PORT || "1433"),
  database: process.env.SQL_SERVER_DATABASE!,
  user: process.env.SQL_SERVER_USER!,
  password: process.env.SQL_SERVER_PASSWORD!,
  
  options: {
    encrypt: true,              // Obrigatorio para Azure SQL
    trustServerCertificate: false, // false em producao
    enableArithAbort: true,
    connectTimeout: 30000,       // 30 segundos
    requestTimeout: 120000,      // 2 minutos (scans longos)
  },
  
  pool: {
    max: 10,                     // Max conexoes simultaneas
    min: 2,                      // Min conexoes ativas
    idleTimeoutMillis: 30000,    // Fechar idle apos 30s
    acquireTimeoutMillis: 30000, // Timeout para obter conexao
  },
};

// Exemplo de uso:
const pool = await sql.connect(config);
const result = await pool.request()
  .input("schema", sql.NVarChar, "dbo")
  .query(\`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema
      AND DATA_TYPE IN ('varchar', 'nvarchar', 'char')
      AND CHARACTER_MAXIMUM_LENGTH >= 11
  \`);

await pool.close();`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

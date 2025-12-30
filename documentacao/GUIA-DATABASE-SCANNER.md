# 🗄️ Guia Completo - Database Scanner

## 📖 Visão Geral

O Database Scanner é uma ferramenta que escaneia bancos de dados SQL Server e Oracle em busca de CNPJs armazenados, validando-os e identificando quais precisam ser migrados para o formato alfanumérico.

---

## 🎯 Casos de Uso

1. **Auditoria de Dados**: Identificar onde CNPJs estão armazenados
2. **Planejamento de Migração**: Descobrir quantos CNPJs precisam ser convertidos
3. **Validação de Integridade**: Encontrar CNPJs inválidos no banco
4. **Mapeamento de Schema**: Entender quais tabelas contêm dados fiscais

---

## 🔌 Configuração de Conexão

### SQL Server

**Connection String Padrão:**
```
Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;
```

**Connection String com Windows Authentication:**
```
Server=myServerAddress;Database=myDataBase;Integrated Security=true;
```

**Connection String com Encrypt:**
```
Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;Encrypt=true;TrustServerCertificate=true;
```

### Oracle

**Easy Connect:**
```
user/password@hostname:port/servicename
```

**TNS Names:**
```
user/password@tnsname
```

**Exemplo Completo:**
```
admin/senha123@192.168.1.100:1521/ORCL
```

---

## 📋 Como Usar

### Passo a Passo:

1. **Acesse** a página `/database-scanner`

2. **Selecione o tipo de banco:**
   - ☑️ SQL Server
   - ☐ Oracle

3. **Informe a Connection String:**
   - Cole a string de conexão completa
   - A string é criptografada e nunca armazenada

4. **Schemas (Opcional):**
   - Deixe vazio para escanear todos
   - Ou especifique: `dbo, sales, hr`

5. **Clique em "Iniciar Scan"**

6. **Aguarde os resultados:**
   - Processo pode levar de segundos a minutos
   - Depende do tamanho do banco

---

## 📊 Interpretando os Resultados

### Estatísticas Gerais:

- **CNPJs Encontrados**: Total de valores que parecem ser CNPJs
- **CNPJs Válidos**: CNPJs que passaram na validação dos dígitos verificadores
- **Precisam Migração**: CNPJs numéricos que devem ser convertidos
- **Tabelas Afetadas**: Número de tabelas que contêm CNPJs

### Detalhes de Cada Finding:

```
Schema: dbo
Table: Clientes
Column: CNPJ
Value: 12.345.678/0001-90
Row ID: ABC123-456...
Status: ✅ Válido | ⚠️ Precisa Migração
```

---

## 🔍 O Que o Scanner Procura

### Padrões Detectados:

1. **CNPJ Formatado:**
   - `12.345.678/0001-90`
   - `11.222.333/0001-81`

2. **CNPJ Sem Formatação:**
   - `12345678000190`
   - `11222333000181`

### Tipos de Coluna Escaneados:

**SQL Server:**
- VARCHAR, CHAR
- NVARCHAR, NCHAR
- TEXT, NTEXT

**Oracle:**
- VARCHAR2, CHAR
- CLOB

**Tamanho Mínimo:** 11 caracteres (para conter um CNPJ)

---

## ⚠️ Limitações e Considerações

### Performance:

- Scanner limita a **1000 linhas por tabela**
- Para bancos grandes, considere escanear por schema
- Use horários de baixo uso para não impactar performance

### Segurança:

- ✅ Connection string nunca é armazenada
- ✅ Apenas hash seguro é salvo
- ✅ Resultados isolados por usuário (RLS)
- ⚠️ Requer permissões READ no banco

### Permissões Necessárias:

**SQL Server:**
```sql
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO scanner_user;
GRANT SELECT ON [schema].[table] TO scanner_user;
```

**Oracle:**
```sql
GRANT SELECT ON ALL_TAB_COLUMNS TO scanner_user;
GRANT SELECT ON schema.table TO scanner_user;
```

---

## 🛠️ Troubleshooting

### Erro: "Não foi possível conectar"

**Causas:**
- Connection string incorreta
- Firewall bloqueando
- Credenciais inválidas
- Banco offline

**Solução:**
- Teste a conexão com outra ferramenta (SSMS, SQL Developer)
- Verifique se o IP do servidor v0 está liberado no firewall
- Confirme usuário e senha

### Erro: "Timeout"

**Causas:**
- Banco muito grande
- Rede lenta
- Queries complexas

**Solução:**
- Especifique apenas schemas necessários
- Execute em horários de baixo uso
- Divida o scan em múltiplas execuções

### Nenhum CNPJ Encontrado

**Causas:**
- CNPJs em formato não reconhecido
- Schemas errados
- Permissões insuficientes

**Solução:**
- Verifique o formato dos CNPJs no banco
- Confirme os nomes dos schemas
- Valide as permissões do usuário

---

## 📈 Exemplos de Relatórios

### Exemplo 1: Banco Limpo
```
CNPJs Encontrados: 0
CNPJs Válidos: 0
Precisam Migração: 0
Tabelas Afetadas: 0

Resultado: ✅ Nenhuma ação necessária
```

### Exemplo 2: Migração Necessária
```
CNPJs Encontrados: 1,247
CNPJs Válidos: 1,245
Precisam Migração: 1,245
Tabelas Afetadas: 8

Resultado: ⚠️ Planeje a migração de 1.245 CNPJs em 8 tabelas
```

### Exemplo 3: Dados Corrompidos
```
CNPJs Encontrados: 532
CNPJs Válidos: 421
Precisam Migração: 421
Tabelas Afetadas: 3

Resultado: 🚨 111 CNPJs inválidos encontrados - revise os dados
```

---

## 🎯 Próximos Passos Após o Scan

1. **Exportar Resultados:** Salve o relatório para análise
2. **Planejar Migração:** Estime tempo e recursos necessários
3. **Criar Scripts:** Desenvolva scripts de conversão
4. **Testar em Homologação:** Valide o processo antes da produção
5. **Executar Migração:** Converta os CNPJs para alfanumérico
6. **Validar Resultados:** Execute novo scan para confirmar

---

## 🔐 Boas Práticas de Segurança

1. **Nunca compartilhe connection strings**
2. **Use usuários com permissões mínimas (READ-ONLY)**
3. **Execute scans em ambientes de homologação primeiro**
4. **Monitore logs de acesso ao banco**
5. **Documente todos os scans realizados**
6. **Mantenha backups antes de qualquer migração**

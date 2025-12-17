-- Create 4 developers for Aegis Technology
DO $$
DECLARE
  aegis_client_id UUID;
  dev1_id UUID;
  dev2_id UUID;
  dev3_id UUID;
  dev4_id UUID;
BEGIN
  -- Get Aegis Technology client ID
  SELECT id INTO aegis_client_id FROM clients WHERE name = 'Aegis Technology' LIMIT 1;
  
  IF aegis_client_id IS NULL THEN
    -- Create Aegis Technology if it doesn't exist
    INSERT INTO clients (id, name, cnpj, email, status)
    VALUES (
      gen_random_uuid(),
      'Aegis Technology',
      '12345678901234',
      'contato@aegistech.com',
      'active'
    )
    RETURNING id INTO aegis_client_id;
  END IF;

  -- Create Developer 1: Carlos Silva
  INSERT INTO users (id, name, email, password_hash, role, client_id, status)
  VALUES (
    gen_random_uuid(),
    'Carlos Silva',
    'carlos.silva@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    aegis_client_id,
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = EXCLUDED.status
  RETURNING id INTO dev1_id;

  -- Create Developer 2: Ana Santos
  INSERT INTO users (id, name, email, password_hash, role, client_id, status)
  VALUES (
    gen_random_uuid(),
    'Ana Santos',
    'ana.santos@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    aegis_client_id,
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = EXCLUDED.status
  RETURNING id INTO dev2_id;

  -- Create Developer 3: Bruno Costa
  INSERT INTO users (id, name, email, password_hash, role, client_id, status)
  VALUES (
    gen_random_uuid(),
    'Bruno Costa',
    'bruno.costa@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    aegis_client_id,
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = EXCLUDED.status
  RETURNING id INTO dev3_id;

  -- Create Developer 4: Mariana Oliveira
  INSERT INTO users (id, name, email, password_hash, role, client_id, status)
  VALUES (
    gen_random_uuid(),
    'Mariana Oliveira',
    'mariana.oliveira@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    aegis_client_id,
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = EXCLUDED.status
  RETURNING id INTO dev4_id;

  -- Create 14 tasks for Carlos Silva (dev1_id)
  INSERT INTO tasks (title, description, status, priority, client_id, assigned_to, created_at)
  VALUES
    ('Implementar autenticação JWT', 'Adicionar sistema de autenticação com JSON Web Tokens', 'pending', 'high', aegis_client_id, dev1_id, NOW()),
    ('Criar API de usuários', 'Endpoints para CRUD de usuários', 'pending', 'high', aegis_client_id, dev1_id, NOW()),
    ('Implementar validação de CNPJ', 'Adicionar validação de CNPJ nos formulários', 'in_progress', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Corrigir bug no login', 'Usuários não conseguem fazer login em alguns casos', 'pending', 'critical', aegis_client_id, dev1_id, NOW()),
    ('Adicionar testes unitários', 'Criar testes para módulo de autenticação', 'pending', 'low', aegis_client_id, dev1_id, NOW()),
    ('Otimizar consultas SQL', 'Melhorar performance das queries de relatórios', 'pending', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Implementar cache Redis', 'Adicionar camada de cache com Redis', 'pending', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Criar documentação API', 'Documentar endpoints com Swagger', 'pending', 'low', aegis_client_id, dev1_id, NOW()),
    ('Refatorar código legado', 'Limpar e modernizar código antigo', 'pending', 'low', aegis_client_id, dev1_id, NOW()),
    ('Implementar logs de auditoria', 'Adicionar sistema de logs para ações críticas', 'pending', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Adicionar rate limiting', 'Implementar limitação de requisições na API', 'pending', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Corrigir vulnerabilidade XSS', 'Sanitizar inputs para prevenir XSS', 'pending', 'critical', aegis_client_id, dev1_id, NOW()),
    ('Implementar websockets', 'Adicionar comunicação em tempo real', 'pending', 'medium', aegis_client_id, dev1_id, NOW()),
    ('Criar dashboard de métricas', 'Painel com estatísticas do sistema', 'pending', 'low', aegis_client_id, dev1_id, NOW());

  -- Create 14 tasks for Ana Santos (dev2_id)
  INSERT INTO tasks (title, description, status, priority, client_id, assigned_to, created_at)
  VALUES
    ('Desenvolver página de relatórios', 'Criar interface para visualização de relatórios', 'pending', 'high', aegis_client_id, dev2_id, NOW()),
    ('Implementar filtros avançados', 'Adicionar filtros dinâmicos nas tabelas', 'in_progress', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Criar componente de gráficos', 'Desenvolver componentes reutilizáveis de charts', 'pending', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Melhorar responsividade mobile', 'Ajustar layout para dispositivos móveis', 'pending', 'high', aegis_client_id, dev2_id, NOW()),
    ('Implementar modo escuro', 'Adicionar tema dark mode', 'pending', 'low', aegis_client_id, dev2_id, NOW()),
    ('Otimizar carregamento de imagens', 'Implementar lazy loading e compressão', 'pending', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Criar sistema de notificações', 'Toast notifications e alerts', 'pending', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Implementar busca global', 'Barra de busca com autocomplete', 'pending', 'low', aegis_client_id, dev2_id, NOW()),
    ('Desenvolver upload de arquivos', 'Componente drag-and-drop para upload', 'pending', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Criar wizard de onboarding', 'Tutorial interativo para novos usuários', 'pending', 'low', aegis_client_id, dev2_id, NOW()),
    ('Implementar exportação Excel', 'Função para exportar dados em Excel', 'pending', 'medium', aegis_client_id, dev2_id, NOW()),
    ('Corrigir bug de scroll infinito', 'Scroll não carrega mais itens', 'pending', 'high', aegis_client_id, dev2_id, NOW()),
    ('Adicionar animações', 'Melhorar UX com micro-interactions', 'pending', 'low', aegis_client_id, dev2_id, NOW()),
    ('Criar página de perfil', 'Tela para usuário editar seus dados', 'pending', 'medium', aegis_client_id, dev2_id, NOW());

  -- Create 14 tasks for Bruno Costa (dev3_id)
  INSERT INTO tasks (title, description, status, priority, client_id, assigned_to, created_at)
  VALUES
    ('Configurar CI/CD pipeline', 'Setup de deploy automático', 'in_progress', 'high', aegis_client_id, dev3_id, NOW()),
    ('Implementar backup automático', 'Sistema de backup diário do banco', 'pending', 'critical', aegis_client_id, dev3_id, NOW()),
    ('Configurar monitoramento', 'Setup de APM e alertas', 'pending', 'high', aegis_client_id, dev3_id, NOW()),
    ('Otimizar Docker images', 'Reduzir tamanho das imagens Docker', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Implementar load balancer', 'Configurar balanceamento de carga', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Criar scripts de migração', 'Automatizar migrations do banco', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Configurar SSL/TLS', 'Implementar certificados HTTPS', 'pending', 'high', aegis_client_id, dev3_id, NOW()),
    ('Implementar queue system', 'Sistema de filas para tarefas assíncronas', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Configurar email service', 'Setup de envio de emails transacionais', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Criar health check endpoints', 'Endpoints para monitoramento de saúde', 'pending', 'low', aegis_client_id, dev3_id, NOW()),
    ('Implementar CDN', 'Configurar CDN para assets estáticos', 'pending', 'low', aegis_client_id, dev3_id, NOW()),
    ('Otimizar índices do banco', 'Melhorar performance com índices', 'pending', 'medium', aegis_client_id, dev3_id, NOW()),
    ('Configurar WAF', 'Web Application Firewall para segurança', 'pending', 'high', aegis_client_id, dev3_id, NOW()),
    ('Criar disaster recovery plan', 'Plano de recuperação de desastres', 'pending', 'critical', aegis_client_id, dev3_id, NOW());

  -- Create 14 tasks for Mariana Oliveira (dev4_id)
  INSERT INTO tasks (title, description, status, priority, client_id, assigned_to, created_at)
  VALUES
    ('Implementar integração Stripe', 'Sistema de pagamentos com Stripe', 'pending', 'high', aegis_client_id, dev4_id, NOW()),
    ('Criar API de webhooks', 'Endpoints para receber webhooks externos', 'in_progress', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Implementar OAuth Google', 'Login social com Google', 'pending', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Criar sistema de permissões', 'RBAC para controle de acesso', 'pending', 'high', aegis_client_id, dev4_id, NOW()),
    ('Implementar 2FA', 'Autenticação de dois fatores', 'pending', 'high', aegis_client_id, dev4_id, NOW()),
    ('Desenvolver API de relatórios', 'Endpoints para geração de relatórios', 'pending', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Criar sistema de tags', 'Categorização com tags', 'pending', 'low', aegis_client_id, dev4_id, NOW()),
    ('Implementar busca full-text', 'Busca avançada com Elasticsearch', 'pending', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Desenvolver API de comentários', 'Sistema de comentários e feedback', 'pending', 'low', aegis_client_id, dev4_id, NOW()),
    ('Criar sistema de notificações push', 'Push notifications para web e mobile', 'pending', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Implementar versionamento de API', 'Suporte para múltiplas versões', 'pending', 'low', aegis_client_id, dev4_id, NOW()),
    ('Desenvolver analytics tracking', 'Sistema de métricas e analytics', 'pending', 'medium', aegis_client_id, dev4_id, NOW()),
    ('Criar API de integração Slack', 'Notificações via Slack', 'pending', 'low', aegis_client_id, dev4_id, NOW()),
    ('Implementar geolocalização', 'Funcionalidades baseadas em localização', 'pending', 'low', aegis_client_id, dev4_id, NOW());

END $$;

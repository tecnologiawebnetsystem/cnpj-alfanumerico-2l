// Feature flags and limits by plan
export const PLAN_FEATURES = {
  free: {
    max_users: 1,
    max_analyses: 5,
    max_repositories: 3,
    features: ["basic_analysis", "email_support"],
  },
  basic: {
    max_users: 5,
    max_analyses: 50,
    max_repositories: 20,
    features: ["basic_analysis", "priority_support", "pdf_reports", "task_management"],
  },
  pro: {
    max_users: 20,
    max_analyses: -1, // unlimited
    max_repositories: -1,
    features: [
      "basic_analysis",
      "advanced_analysis",
      "priority_support",
      "pdf_reports",
      "task_management",
      "api_access",
      "integrations",
      "ai_suggestions",
      "scheduled_analyses",
      "webhooks",
    ],
  },
  enterprise: {
    max_users: -1,
    max_analyses: -1,
    max_repositories: -1,
    features: [
      "basic_analysis",
      "advanced_analysis",
      "dedicated_support",
      "pdf_reports",
      "task_management",
      "api_access",
      "integrations",
      "ai_suggestions",
      "scheduled_analyses",
      "webhooks",
      "custom_branding",
      "sla_guarantee",
      "training",
      "custom_features",
    ],
  },
}

export const ACHIEVEMENT_CATEGORIES = {
  analysis: "Análises",
  tasks: "Tarefas",
  streak: "Consistência",
  collaboration: "Colaboração",
  speed: "Velocidade",
  quality: "Qualidade",
}

export const NOTIFICATION_TYPES = {
  task_assigned: "Tarefa Atribuída",
  license_expiring: "Licença Expirando",
  analysis_complete: "Análise Completa",
  comment_mention: "Menção em Comentário",
  achievement_earned: "Conquista Desbloqueada",
  system: "Sistema",
}

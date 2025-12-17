// Core types for the entire system
export type UserRole = "super_admin" | "admin" | "dev" | "user"
export type NotificationType =
  | "task_assigned"
  | "license_expiring"
  | "analysis_complete"
  | "comment_mention"
  | "achievement_earned"
  | "system"
export type NotificationPriority = "low" | "normal" | "high" | "urgent"
export type AchievementRarity = "common" | "rare" | "epic" | "legendary"
export type IntegrationType = "slack" | "jira" | "trello" | "gitlab" | "bitbucket" | "whatsapp"
export type PlanType = "free" | "basic" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "suspended" | "trial"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

export interface Notification {
  id: string
  user_id: string
  client_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  read_at?: string
  priority: NotificationPriority
  category?: string
  metadata?: Record<string, any>
  created_at: string
  expires_at?: string
}

export interface Achievement {
  id: string
  name: string
  display_name: string
  description: string
  icon?: string
  category: string
  points: number
  rarity: AchievementRarity
  requirement_type: string
  requirement_value: number
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress: number
  metadata?: Record<string, any>
  achievement?: Achievement
}

export interface UserStats {
  id: string
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  last_activity_date?: string
  tasks_completed: number
  analyses_completed: number
  comments_made: number
  achievements_earned: number
  rank: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  client_id: string
  entity_type: string
  entity_id: string
  parent_comment_id?: string
  content: string
  mentions?: string[]
  attachments?: any[]
  is_edited: boolean
  edited_at?: string
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
    role: UserRole
  }
}

export interface ActivityLog {
  id: string
  user_id?: string
  client_id: string
  action: string
  entity_type: string
  entity_id?: string
  entity_name?: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Plan {
  id: string
  name: string
  display_name: string
  description?: string
  price_monthly?: number
  price_quarterly?: number
  price_annual?: number
  features: string[]
  limits: {
    max_users: number
    max_analyses: number
    max_repositories: number
  }
  is_active: boolean
  is_popular: boolean
  sort_order: number
}

export interface Subscription {
  id: string
  client_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: "monthly" | "quarterly" | "annual"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  trial_start?: string
  trial_end?: string
  plan?: Plan
}

export interface AISuggestion {
  id: string
  finding_id?: string
  database_finding_id?: string
  client_id: string
  suggestion_type: string
  original_code?: string
  suggested_code?: string
  explanation?: string
  confidence_score?: number
  model_used?: string
  tokens_used?: number
  status: "pending" | "accepted" | "rejected" | "modified"
  applied_by?: string
  applied_at?: string
  feedback?: string
  created_at: string
}

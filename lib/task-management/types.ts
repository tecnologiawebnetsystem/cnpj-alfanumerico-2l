export interface TaskData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
  assignee?: string
  labels?: string[]
  dueDate?: Date
  codeContext?: {
    file: string
    line: number
    language: string
    codeBefore: string
    codeCurrent: string
    codeSuggested: string
    codeAfter: string
    repository: string
  }
}

export interface TaskResult {
  id: string
  key: string
  url: string
  provider: string
  createdAt: Date
  metadata?: Record<string, any>
}

export interface TaskManagementClient {
  createTask(task: TaskData): Promise<TaskResult>
  updateTask(taskId: string, data: Partial<TaskData>): Promise<void>
  getTask(taskId: string): Promise<TaskResult>
  deleteTask(taskId: string): Promise<void>
  addComment(taskId: string, comment: string): Promise<void>
  attachFile?(taskId: string, file: Buffer, filename: string): Promise<void>
  getTaskUrl(taskId: string): string
}

export interface TaskManagementConfig {
  provider: 'github-issues' | 'azure-boards'
  token: string
  organization?: string
  project?: string
  baseUrl?: string
  workspace?: string
}

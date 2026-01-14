import type { TaskManagementClient, TaskData, TaskResult, TaskManagementConfig } from './types'

export class GitHubIssuesClient implements TaskManagementClient {
  private config: TaskManagementConfig
  private baseUrl = 'https://api.github.com'

  constructor(config: TaskManagementConfig) {
    this.config = config
  }

  async createTask(task: TaskData): Promise<TaskResult> {
    console.log(' GitHub Issues: Creating issue...')
    
    const [owner, repo] = this.config.project!.split('/')
    
    const issue = {
      title: task.title,
      body: this.formatDescription(task),
      labels: this.mapLabels(task),
      ...(task.assignee && { assignees: [task.assignee] })
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(issue)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(' GitHub: Error creating issue:', error)
      throw new Error(`Failed to create GitHub issue: ${error}`)
    }

    const result = await response.json()
    console.log(' GitHub Issues: Issue created #', result.number)

    return {
      id: result.id.toString(),
      key: `#${result.number}`,
      url: result.html_url,
      provider: 'github-issues',
      createdAt: new Date(result.created_at)
    }
  }

  async updateTask(taskId: string, data: Partial<TaskData>): Promise<void> {
    const [owner, repo] = this.config.project!.split('/')
    
    const update: any = {}
    if (data.title) update.title = data.title
    if (data.description) update.body = this.formatDescription(data as TaskData)
    if (data.status === 'done') update.state = 'closed'
    if (data.status === 'todo' || data.status === 'in_progress') update.state = 'open'

    await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify(update)
    })
  }

  async getTask(taskId: string): Promise<TaskResult> {
    const [owner, repo] = this.config.project!.split('/')
    
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    const issue = await response.json()
    
    return {
      id: issue.id.toString(),
      key: `#${issue.number}`,
      url: issue.html_url,
      provider: 'github-issues',
      createdAt: new Date(issue.created_at)
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    // GitHub doesn't support deleting issues, so we close it instead
    await this.updateTask(taskId, { status: 'done' })
  }

  async addComment(taskId: string, comment: string): Promise<void> {
    const [owner, repo] = this.config.project!.split('/')
    
    await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({ body: comment })
    })
  }

  getTaskUrl(taskId: string): string {
    const [owner, repo] = this.config.project!.split('/')
    return `https://github.com/${owner}/${repo}/issues/${taskId}`
  }

  private formatDescription(task: TaskData): string {
    let desc = task.description + '\n\n'
    
    if (task.codeContext) {
      desc += `### Detalhes\n\n`
      desc += `**Arquivo:** \`${task.codeContext.file}\`\n`
      desc += `**Linha:** ${task.codeContext.line}\n`
      desc += `**Repositório:** ${task.codeContext.repository}\n\n`
      desc += `### Código Atual\n\`\`\`${task.codeContext.language}\n${task.codeContext.codeCurrent}\n\`\`\`\n\n`
      desc += `### Código Sugerido\n\`\`\`${task.codeContext.language}\n${task.codeContext.codeSuggested}\n\`\`\`\n`
    }
    
    return desc
  }

  private mapLabels(task: TaskData): string[] {
    const labels = [...(task.labels || [])]
    
    // Add priority label
    labels.push(`priority: ${task.priority}`)
    
    // Add CNPJ migration label
    labels.push('cnpj-migration')
    
    return labels
  }
}

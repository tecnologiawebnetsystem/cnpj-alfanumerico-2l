import type { TaskManagementClient, TaskManagementConfig } from './types'
import { GitHubIssuesClient } from './github-issues-client'
import { AzureDevOpsClient } from '@/lib/git/azure-client'

export function createTaskManagementClient(config: TaskManagementConfig): TaskManagementClient {
  console.log('[v0] Creating task management client for provider:', config.provider)
  
  switch (config.provider) {
    case 'github-issues':
      return new GitHubIssuesClient(config)
    
    case 'azure-boards':
      return new AzureDevOpsClient({
        token: config.token,
        organization: config.organization!,
        project: config.project!,
        repository: config.project!
      }) as unknown as TaskManagementClient
    
    default:
      throw new Error(`Unsupported task management provider: ${config.provider}`)
  }
}

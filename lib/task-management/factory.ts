import type { TaskManagementClient, TaskManagementConfig, TaskData } from "./types"
import { GitHubIssuesClient } from "./github-issues-client"
import { AzureDevOpsClient } from "@/lib/git/azure-client"

export function createTaskManagementClient(config: TaskManagementConfig): TaskManagementClient {
  console.log(" Creating task management client for provider:", config.provider)

  switch (config.provider) {
    case "github-issues":
      return new GitHubIssuesClient(config)

    case "azure-boards":
      const azureClient = new AzureDevOpsClient({
        token: config.token,
        organization: config.organization!,
        project: config.project!,
        repository: config.project!,
      })

      // Create adapter to match TaskManagementClient interface
      return {
        createTask: async (task: TaskData) => {
          // Implement Azure Boards task creation
          throw new Error("Azure Boards task creation not fully implemented")
        },
        updateTask: async (id: string, data: Partial<TaskData>) => {
          throw new Error("Azure Boards update not implemented")
        },
        getTask: async (id: string) => {
          throw new Error("Azure Boards get not implemented")
        },
        deleteTask: async (id: string) => {
          throw new Error("Azure Boards delete not implemented")
        },
        addComment: async (id: string, comment: string) => {
          throw new Error("Azure Boards comment not implemented")
        },
        getTaskUrl: (id: string) => {
          return `https://dev.azure.com/${config.organization}/${config.project}`
        },
      } as TaskManagementClient

    case "gitlab":
      throw new Error("GitLab task management not yet implemented - use GitLab API directly")

    default:
      throw new Error(`Unsupported task management provider: ${config.provider}`)
  }
}

interface AzureDevOpsConfig {
  token: string
  organization: string
  project: string
  repository: string
}

interface CreateBranchParams {
  branchName: string
  baseBranch?: string
}

interface CreateCommitParams {
  branch: string
  filePath: string
  content: string
  message: string
}

interface CreatePullRequestParams {
  title: string
  description: string
  sourceBranch: string
  targetBranch: string
}

export class AzureDevOpsClient {
  private config: AzureDevOpsConfig
  private baseUrl: string

  constructor(config: AzureDevOpsConfig) {
    this.config = config
    this.baseUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis`
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log(`[v0] Azure DevOps API Request: ${options.method || 'GET'} ${endpoint}`)
    
    const auth = Buffer.from(`:${this.config.token}`).toString('base64')
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] Azure DevOps API Error:', data)
      throw new Error(`Azure DevOps API error: ${data.message || response.statusText}`)
    }

    console.log('[v0] Azure DevOps API Response:', data)
    return data
  }

  async getMainBranchRef(baseBranch: string = 'main'): Promise<string> {
    console.log(`[v0] Getting ref for branch: ${baseBranch}`)
    
    const data = await this.request(`/git/repositories/${this.config.repository}/refs?filter=heads/${baseBranch}&api-version=7.0`)
    
    if (data.value && data.value.length > 0) {
      return data.value[0].objectId
    }
    
    throw new Error(`Branch ${baseBranch} not found`)
  }

  async createBranch({ branchName, baseBranch = 'main' }: CreateBranchParams): Promise<string> {
    console.log(`[v0] Creating branch: ${branchName} from ${baseBranch}`)
    
    const baseObjectId = await this.getMainBranchRef(baseBranch)
    
    await this.request(`/git/repositories/${this.config.repository}/refs?api-version=7.0`, {
      method: 'POST',
      body: JSON.stringify([{
        name: `refs/heads/${branchName}`,
        oldObjectId: '0000000000000000000000000000000000000000',
        newObjectId: baseObjectId,
      }]),
    })

    console.log(`[v0] Branch created successfully: ${branchName}`)
    return branchName
  }

  async getFileContent(filePath: string): Promise<string> {
    console.log(`[v0] Reading file: ${filePath}`)
    
    const data = await this.request(
      `/git/repositories/${this.config.repository}/items?path=${encodeURIComponent(filePath)}&api-version=7.0`
    )
    
    console.log(`[v0] File content retrieved`)
    return data.content || data
  }

  async createCommit({ branch, filePath, content, message }: CreateCommitParams): Promise<string> {
    console.log(`[v0] Creating commit on branch: ${branch}`)
    console.log(`[v0] File: ${filePath}`)
    console.log(`[v0] Message: ${message}`)
    
    const refName = `refs/heads/${branch}`
    const oldObjectId = await this.getMainBranchRef(branch)
    
    const data = await this.request(`/git/repositories/${this.config.repository}/pushes?api-version=7.0`, {
      method: 'POST',
      body: JSON.stringify({
        refUpdates: [{
          name: refName,
          oldObjectId,
        }],
        commits: [{
          comment: message,
          changes: [{
            changeType: 'edit',
            item: { path: filePath },
            newContent: {
              content,
              contentType: 'rawtext',
            },
          }],
        }],
      }),
    })

    console.log(`[v0] Commit created: ${data.commits[0].commitId}`)
    return data.commits[0].commitId
  }

  async createPullRequest({ title, description, sourceBranch, targetBranch }: CreatePullRequestParams): Promise<{ number: number; url: string }> {
    console.log(`[v0] Creating Pull Request: ${title}`)
    console.log(`[v0] From: ${sourceBranch} → To: ${targetBranch}`)
    
    const data = await this.request(`/git/repositories/${this.config.repository}/pullrequests?api-version=7.0`, {
      method: 'POST',
      body: JSON.stringify({
        sourceRefName: `refs/heads/${sourceBranch}`,
        targetRefName: `refs/heads/${targetBranch}`,
        title,
        description,
      }),
    })

    const prUrl = `https://dev.azure.com/${this.config.organization}/${this.config.project}/_git/${this.config.repository}/pullrequest/${data.pullRequestId}`

    console.log(`[v0] Pull Request created: #${data.pullRequestId}`)
    console.log(`[v0] URL: ${prUrl}`)
    
    return {
      number: data.pullRequestId,
      url: prUrl,
    }
  }
}

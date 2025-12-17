interface GitHubConfig {
  token: string
  owner: string
  repo: string
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
  body: string
  head: string
  base: string
}

export class GitHubClient {
  private config: GitHubConfig
  private baseUrl = 'https://api.github.com'

  constructor(config: GitHubConfig) {
    this.config = config
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log(`[v0] GitHub API Request: ${options.method || 'GET'} ${endpoint}`)
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] GitHub API Error:', data)
      throw new Error(`GitHub API error: ${data.message || response.statusText}`)
    }

    console.log('[v0] GitHub API Response:', data)
    return data
  }

  async getMainBranchSHA(baseBranch: string = 'main'): Promise<string> {
    console.log(`[v0] Getting SHA for branch: ${baseBranch}`)
    
    try {
      const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${baseBranch}`)
      return data.object.sha
    } catch (error) {
      // Try 'master' if 'main' fails
      if (baseBranch === 'main') {
        console.log('[v0] Branch "main" not found, trying "master"...')
        const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/master`)
        return data.object.sha
      }
      throw error
    }
  }

  async createBranch({ branchName, baseBranch = 'main' }: CreateBranchParams): Promise<string> {
    console.log(`[v0] Creating branch: ${branchName} from ${baseBranch}`)
    
    const sha = await this.getMainBranchSHA(baseBranch)
    
    await this.request(`/repos/${this.config.owner}/${this.config.repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    })

    console.log(`[v0] Branch created successfully: ${branchName}`)
    return branchName
  }

  async getFileContent(filePath: string, branch?: string): Promise<{ content: string; sha: string }> {
    console.log(`[v0] Reading file: ${filePath}${branch ? ` from branch: ${branch}` : ''}`)
    
    const params = branch ? `?ref=${branch}` : ''
    const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}${params}`)
    
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    
    console.log(`[v0] File content retrieved (${content.length} bytes)`)
    return { content, sha: data.sha }
  }

  async createCommit({ branch, filePath, content, message }: CreateCommitParams): Promise<string> {
    console.log(`[v0] Creating commit on branch: ${branch}`)
    console.log(`[v0] File: ${filePath}`)
    console.log(`[v0] Message: ${message}`)
    
    const { sha } = await this.getFileContent(filePath, branch)
    
    const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      }),
    })

    console.log(`[v0] Commit created: ${data.commit.sha}`)
    return data.commit.sha
  }

  async createPullRequest({ title, body, head, base }: CreatePullRequestParams): Promise<{ number: number; url: string }> {
    console.log(`[v0] Creating Pull Request: ${title}`)
    console.log(`[v0] From: ${head} → To: ${base}`)
    
    const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    })

    console.log(`[v0] Pull Request created: #${data.number}`)
    console.log(`[v0] URL: ${data.html_url}`)
    
    return {
      number: data.number,
      url: data.html_url,
    }
  }
}

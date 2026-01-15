interface GitLabConfig {
  token: string
  project: string // Full project path like "username/project"
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

interface CreateMergeRequestParams {
  title: string
  description: string
  sourceBranch: string
  targetBranch: string
}

export class GitLabClient {
  private config: GitLabConfig
  private baseUrl: string

  constructor(config: GitLabConfig) {
    this.config = config
    this.baseUrl = "https://gitlab.com/api/v4"
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log(` GitLab API Request: ${options.method || "GET"} ${endpoint}`)

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "PRIVATE-TOKEN": this.config.token,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(" GitLab API Error:", data)
      throw new Error(`GitLab API error: ${data.message || response.statusText}`)
    }

    console.log(" GitLab API Response received")
    return data
  }

  async createBranch({ branchName, baseBranch = "main" }: CreateBranchParams): Promise<string> {
    console.log(` Creating GitLab branch: ${branchName} from ${baseBranch}`)

    const projectPath = encodeURIComponent(this.config.project)

    await this.request(`/projects/${projectPath}/repository/branches`, {
      method: "POST",
      body: JSON.stringify({
        branch: branchName,
        ref: baseBranch,
      }),
    })

    console.log(` GitLab branch created successfully: ${branchName}`)
    return branchName
  }

  async getFileContent(filePath: string, branch = "main"): Promise<string> {
    console.log(` Reading GitLab file: ${filePath}`)

    const projectPath = encodeURIComponent(this.config.project)
    const encodedFilePath = encodeURIComponent(filePath)

    const data = await this.request(`/projects/${projectPath}/repository/files/${encodedFilePath}?ref=${branch}`)

    // GitLab returns base64 encoded content
    const content = Buffer.from(data.content, "base64").toString("utf-8")
    console.log(` GitLab file content retrieved`)
    return content
  }

  async createCommit({ branch, filePath, content, message }: CreateCommitParams): Promise<string> {
    console.log(` Creating GitLab commit on branch: ${branch}`)
    console.log(` File: ${filePath}`)
    console.log(` Message: ${message}`)

    const projectPath = encodeURIComponent(this.config.project)

    const data = await this.request(`/projects/${projectPath}/repository/commits`, {
      method: "POST",
      body: JSON.stringify({
        branch,
        commit_message: message,
        actions: [
          {
            action: "update",
            file_path: filePath,
            content,
          },
        ],
      }),
    })

    console.log(` GitLab commit created: ${data.id}`)
    return data.id
  }

  async createMergeRequest({
    title,
    description,
    sourceBranch,
    targetBranch,
  }: CreateMergeRequestParams): Promise<{ number: number; url: string }> {
    console.log(` Creating GitLab Merge Request: ${title}`)
    console.log(` From: ${sourceBranch} → To: ${targetBranch}`)

    const projectPath = encodeURIComponent(this.config.project)

    const data = await this.request(`/projects/${projectPath}/merge_requests`, {
      method: "POST",
      body: JSON.stringify({
        source_branch: sourceBranch,
        target_branch: targetBranch,
        title,
        description,
      }),
    })

    console.log(` GitLab MR created: !${data.iid}`)
    console.log(` URL: ${data.web_url}`)

    return {
      number: data.iid,
      url: data.web_url,
    }
  }
}

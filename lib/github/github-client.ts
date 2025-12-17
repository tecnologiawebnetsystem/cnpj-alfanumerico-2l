import { Octokit } from "@octokit/rest"

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  default_branch: string
  stargazers_count: number
  forks_count: number
  size: number
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export class GitHubClient {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    })
  }

  async getUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.users.getAuthenticated()
    return {
      id: data.id,
      login: data.login,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar_url,
    }
  }

  async listRepositories(options?: {
    page?: number
    perPage?: number
    sort?: "created" | "updated" | "pushed" | "full_name"
    direction?: "asc" | "desc"
    type?: "all" | "owner" | "public" | "private" | "member"
  }): Promise<GitHubRepository[]> {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      page: options?.page || 1,
      per_page: options?.perPage || 100,
      sort: options?.sort || "updated",
      direction: options?.direction || "desc",
      type: options?.type || "all",
    })

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      default_branch: repo.default_branch,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      size: repo.size,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }))
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    })

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      private: data.private,
      html_url: data.html_url,
      language: data.language,
      default_branch: data.default_branch,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      size: data.size,
      updated_at: data.updated_at,
      owner: {
        login: data.owner.login,
        avatar_url: data.owner.avatar_url,
      },
    }
  }

  async downloadRepository(owner: string, repo: string, ref?: string): Promise<ArrayBuffer> {
    const { data } = await this.octokit.repos.downloadZipballArchive({
      owner,
      repo,
      ref: ref || "HEAD",
    })

    return data as ArrayBuffer
  }

  async searchRepositories(
    query: string,
    options?: {
      page?: number
      perPage?: number
      sort?: "stars" | "forks" | "updated"
      order?: "asc" | "desc"
    },
  ): Promise<GitHubRepository[]> {
    const { data } = await this.octokit.search.repos({
      q: `${query} user:@me`,
      page: options?.page || 1,
      per_page: options?.perPage || 100,
      sort: options?.sort,
      order: options?.order,
    })

    return data.items.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      default_branch: repo.default_branch,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      size: repo.size,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }))
  }
}

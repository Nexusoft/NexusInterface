import axios from 'axios';

/** A GitHub user */
export interface GitHubSimpleUser {
  name: string | null;
  email: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
  user_view_type?: string;
}

export interface GitHubReleaseAsset {
  url: string;
  browser_download_url: string;
  id: number;
  node_id: string;
  /** The file name of the asset */
  name: string;
  label: string | null;
  /** State of the release asset */
  state: 'uploaded' | 'open';
  content_type: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader: GitHubSimpleUser | null;
}

export interface GitHubReactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  confused: number;
  heart: number;
  hooray: number;
  eyes: number;
  rocket: number;
}

/** A release */
export interface GitHubRelease {
  url: string;
  html_url: string;
  assets_url: string;
  upload_url: string;
  tarball_url: string | null;
  zipball_url: string | null;
  id: number;
  node_id: string;
  /** The name of the tag */
  tag_name: string;
  /** Specifies the commitish value that determines where the Git tag is created from */
  target_commitish: string;
  name: string | null;
  body: string | null;
  /** true to create a draft (unpublished) release, false to create a published one */
  draft: boolean;
  /** Whether to identify the release as a prerelease or a full release */
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  author: GitHubSimpleUser;
  assets: GitHubReleaseAsset[];
  body_html: string;
  body_text: string;
  mentions_count: number;
  /** The URL of the release discussion */
  discussion_url: string;
  reactions: GitHubReactions;
}

export interface GitHubMember {
  // Required fields
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  node_id: string;
  login: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;

  // Optional fields
  name?: string | null;
  email?: string | null;
  starred_at?: string;
  user_view_type?: string;
}

export function fetchGithubLatestRelease(
  repoId: string,
  options?: Parameters<typeof axios.get>[1]
) {
  return axios.get<GitHubRelease>(
    `https://api.github.com/repos/${repoId}/releases/latest`,
    options
  );
}

export function getRepoId(repo: { owner: string; repo: string }) {
  return `${repo.owner}/${repo.repo}`;
}

export function getMembers(
  organization: string,
  options?: Parameters<typeof axios.get>[1]
) {
  return axios.get<GitHubMember[]>(
    `https://api.github.com/orgs/${organization}/members`,
    options
  );
}

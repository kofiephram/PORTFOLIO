import { parseGitHubRepoUrl } from './project-utils.js';

const GITHUB_API_BASE = 'https://api.github.com';
const IMAGE_FILE_PATTERN = /\.(?:png|jpe?g|webp|gif)$/i;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IGNORED_PATH_PATTERN = /(^|\/)(?:\.git|\.github|node_modules|dist|build|coverage)(\/|$)/i;
const IGNORED_IMAGE_NAME_PATTERN = /(^|[-_.])(?:logo|icon|favicon|avatar|badge)([-_.]|$)/i;
const FEATURE_IMAGE_PATTERN = /screenshot|preview|demo|homepage|hero|dashboard|ui|screen/i;

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};

const encodePath = path => path.split('/').map(encodeURIComponent).join('/');

const parseHomepage = homepage => {
  if (typeof homepage !== 'string' || !homepage.trim()) return '';
  try {
    const url = new URL(homepage);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export const rankRepositoryImageCandidates = (tree, owner, repository, branch) => (tree || [])
  .filter(entry =>
    entry?.type === 'blob'
    && typeof entry.path === 'string'
    && IMAGE_FILE_PATTERN.test(entry.path)
    && Number.isFinite(entry.size)
    && entry.size > 0
    && entry.size <= MAX_IMAGE_SIZE
    && !IGNORED_PATH_PATTERN.test(entry.path)
    && !IGNORED_IMAGE_NAME_PATTERN.test(entry.path.split('/').pop())
  )
  .map(entry => ({
    path: entry.path,
    name: entry.path.split('/').pop(),
    size: entry.size,
    score: FEATURE_IMAGE_PATTERN.test(entry.path) ? 2 : 1,
    url: `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${encodePath(branch)}/${encodePath(entry.path)}`
  }))
  .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
  .slice(0, 12)
  .map(candidate => ({
    path: candidate.path,
    name: candidate.name,
    size: candidate.size,
    url: candidate.url
  }));

const requestJson = async (url, fetchImpl) => {
  const response = await fetchImpl(url, { headers: githubHeaders });
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub rate limit reached. Try importing again later.');
    }
    if (response.status === 404) {
      throw new Error('Repository not found or not public. Only public GitHub repositories can be imported.');
    }
    throw new Error(`GitHub returned ${response.status} while importing the repository.`);
  }
  return response.json();
};

export const fetchGitHubProject = async (link, fetchImpl = fetch) => {
  const repositoryPath = parseGitHubRepoUrl(link);
  if (!repositoryPath) {
    throw new Error('Enter a valid public GitHub repository URL.');
  }

  const [owner, repository] = repositoryPath.split('/');
  const encodedRepositoryPath = `${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  const repositoryData = await requestJson(`${GITHUB_API_BASE}/repos/${encodedRepositoryPath}`, fetchImpl);
  if (repositoryData.private) {
    throw new Error('Only public GitHub repositories can be imported.');
  }

  const branch = repositoryData.default_branch || 'main';
  const treeUrl = `${GITHUB_API_BASE}/repos/${encodedRepositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const [treeData, languageResult] = await Promise.all([
    requestJson(treeUrl, fetchImpl),
    requestJson(`${GITHUB_API_BASE}/repos/${encodedRepositoryPath}/languages`, fetchImpl)
      .then(languages => ({ languages, error: '' }))
      .catch(error => ({
        languages: {},
        error: error instanceof Error ? error.message : 'GitHub language data could not be loaded.'
      }))
  ]);
  const { languages, error: languageWarning } = languageResult;
  const tags = Array.from(new Set([
    ...Object.keys(languages || {}),
    ...(Array.isArray(repositoryData.topics) ? repositoryData.topics : [])
  ].filter(tag => typeof tag === 'string' && tag.trim())));
  const imageCandidates = rankRepositoryImageCandidates(
    treeData.tree,
    owner,
    repository,
    branch
  );

  return {
    title: repositoryData.name || repository,
    description: repositoryData.description || '',
    repoUrl: repositoryData.html_url || `https://github.com/${owner}/${repository}`,
    demoUrl: parseHomepage(repositoryData.homepage),
    tags,
    imageCandidates,
    note: [
      treeData.truncated
        ? 'GitHub returned a partial file list; image detection may not include every screenshot.'
        : '',
      languageWarning ? `Repository language tags could not be imported: ${languageWarning}` : ''
    ].filter(Boolean).join(' ')
  };
};

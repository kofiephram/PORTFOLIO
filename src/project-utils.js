export const parseGitHubRepoUrl = link => {
  try {
    const url = new URL(link);
    if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return null;

    const [owner, repository] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repository) return null;
    return `${owner}/${repository.replace(/\.git$/i, '')}`;
  } catch {
    return null;
  }
};

export const calculateLanguagePercentages = languageBytes => {
  const entries = Object.entries(languageBytes || {})
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0);
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!totalBytes) return null;

  const percentages = entries.map(([language, bytes], index) => {
    const exactPercentage = (bytes / totalBytes) * 100;
    const roundedDown = Math.floor(exactPercentage);
    return {
      language,
      percentage: roundedDown,
      remainder: exactPercentage - roundedDown,
      index
    };
  });
  let remainder = 100 - percentages.reduce((sum, entry) => sum + entry.percentage, 0);

  percentages
    .slice()
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
    .slice(0, remainder)
    .forEach(entry => {
      percentages[entry.index].percentage += 1;
    });

  return Object.fromEntries(percentages.map(({ language, percentage }) => [language, percentage]));
};

export const analyzeGitHubRepoLanguages = async (link, fetchImpl = fetch) => {
  const repository = parseGitHubRepoUrl(link);
  const unavailable = note => ({
    stackUsage: null,
    stackUsageSource: 'unavailable',
    stackUsageNote: note
  });

  if (!repository) {
    return unavailable('Add a valid public GitHub repository link to analyze its language breakdown.');
  }

  const repositoryPath = repository.split('/').map(encodeURIComponent).join('/');
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${repositoryPath}/languages`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) {
      return unavailable(`GitHub returned ${response.status}; repository language data is unavailable.`);
    }

    const stackUsage = calculateLanguagePercentages(await response.json());
    if (!stackUsage) {
      return unavailable('GitHub reports no language data for this repository.');
    }

    return {
      stackUsage,
      stackUsageSource: 'github',
      stackUsageNote: 'Calculated from GitHub repository language byte counts.'
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return unavailable(`Could not retrieve GitHub language data: ${detail}`);
  }
};

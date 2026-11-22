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

export const calculateTagPercentages = tags => {
  const uniqueTags = [];
  const seenTags = new Set();
  for (const tag of Array.isArray(tags) ? tags : []) {
    if (typeof tag !== 'string' || !tag.trim()) continue;
    const trimmedTag = tag.trim();
    const normalizedTag = trimmedTag.toLowerCase();
    if (seenTags.has(normalizedTag)) continue;
    seenTags.add(normalizedTag);
    uniqueTags.push(trimmedTag);
  }
  if (!uniqueTags.length) return null;

  const percentagePerTag = Math.floor(100 / uniqueTags.length);
  let remainder = 100 - percentagePerTag * uniqueTags.length;
  return Object.fromEntries(uniqueTags.map(tag => [
    tag,
    percentagePerTag + (remainder-- > 0 ? 1 : 0)
  ]));
};

export const analyzeProjectStack = async (link, tags, fetchImpl = fetch) => {
  const tagEstimate = calculateTagPercentages(tags);
  const estimated = note => tagEstimate
    ? {
      stackUsage: tagEstimate,
      stackUsageSource: 'tags',
      stackUsageNote: `${note} Percentages are estimated evenly from the project tags.`
    }
    : {
      stackUsage: null,
      stackUsageSource: 'unavailable',
      stackUsageNote: `${note} Add technology tags to provide an estimate.`
    };
  const repository = parseGitHubRepoUrl(link);

  if (!repository) {
    return estimated('No public GitHub repository was available.');
  }

  const repositoryPath = repository.split('/').map(encodeURIComponent).join('/');
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${repositoryPath}/languages`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) {
      return estimated(`GitHub returned ${response.status}; repository language data is unavailable.`);
    }

    const stackUsage = calculateLanguagePercentages(await response.json());
    if (!stackUsage) {
      return estimated('GitHub reports no language data.');
    }

    return {
      stackUsage,
      stackUsageSource: 'github',
      stackUsageNote: 'Calculated from GitHub repository language byte counts.'
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return estimated(`Could not retrieve GitHub language data (${detail}).`);
  }
};

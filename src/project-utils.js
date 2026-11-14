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

export const estimateStackUsage = tagsInput => {
  const tags = Array.from(new Set(
    tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
  ));
  if (!tags.length) return {};

  const share = Math.floor(100 / tags.length);
  const remainder = 100 - share * tags.length;
  return Object.fromEntries(tags.map((tag, index) => [tag, share + (index < remainder ? 1 : 0)]));
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

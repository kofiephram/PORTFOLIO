import { describe, expect, it } from 'vitest';
import {
  analyzeGitHubRepoLanguages,
  calculateLanguagePercentages,
  parseGitHubRepoUrl
} from './project-utils.js';

describe('parseGitHubRepoUrl', () => {
  it('extracts the owner and repository from GitHub links', () => {
    expect(parseGitHubRepoUrl('https://github.com/example/project.git')).toBe('example/project');
    expect(parseGitHubRepoUrl('https://github.com/example/project/tree/main')).toBe('example/project');
  });

  it('rejects links that do not identify a GitHub repository', () => {
    expect(parseGitHubRepoUrl('https://example.com/project')).toBeNull();
    expect(parseGitHubRepoUrl('https://github.com/example')).toBeNull();
  });
});

describe('calculateLanguagePercentages', () => {
  it('converts repository byte counts into whole percentages totaling 100%', () => {
    const result = calculateLanguagePercentages({
      JavaScript: 700,
      CSS: 200,
      HTML: 100
    });

    expect(result).toEqual({ JavaScript: 70, CSS: 20, HTML: 10 });
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('returns null when the repository has no measurable languages', () => {
    expect(calculateLanguagePercentages({})).toBeNull();
  });
});

describe('analyzeGitHubRepoLanguages', () => {
  it('uses repository language byte counts from GitHub', async () => {
    const fetchImpl = async url => {
      expect(url).toBe('https://api.github.com/repos/example/project/languages');
      return {
        ok: true,
        json: async () => ({ JavaScript: 750, CSS: 250 })
      };
    };

    await expect(analyzeGitHubRepoLanguages('https://github.com/example/project', fetchImpl))
      .resolves.toEqual({
        stackUsage: { JavaScript: 75, CSS: 25 },
        stackUsageSource: 'github',
        stackUsageNote: 'Calculated from GitHub repository language byte counts.'
      });
  });

  it('does not provide percentages when GitHub has no language data', async () => {
    const fetchImpl = async () => ({
      ok: true,
      json: async () => ({})
    });

    await expect(analyzeGitHubRepoLanguages('https://github.com/example/project', fetchImpl))
      .resolves.toEqual({
        stackUsage: null,
        stackUsageSource: 'unavailable',
        stackUsageNote: 'GitHub reports no language data for this repository.'
      });
  });

  it('reports request failures without estimating from tags', async () => {
    const fetchImpl = async () => ({ ok: false, status: 403 });

    await expect(analyzeGitHubRepoLanguages('https://github.com/example/project', fetchImpl))
      .resolves.toEqual({
        stackUsage: null,
        stackUsageSource: 'unavailable',
        stackUsageNote: 'GitHub returned 403; repository language data is unavailable.'
      });
  });
});

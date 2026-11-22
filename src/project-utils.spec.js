import { describe, expect, it } from 'vitest';
import {
  analyzeProjectStack,
  calculateLanguagePercentages,
  calculateTagPercentages,
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

describe('calculateTagPercentages', () => {
  it('distributes estimates evenly across unique non-empty technology tags', () => {
    const result = calculateTagPercentages(['React', ' Python ', 'react', '', 'Node.js']);

    expect(result).toEqual({ React: 34, Python: 33, 'Node.js': 33 });
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('returns null when no usable technology tags are provided', () => {
    expect(calculateTagPercentages([])).toBeNull();
    expect(calculateTagPercentages([' ', null])).toBeNull();
  });
});

describe('analyzeProjectStack', () => {
  it('uses repository language byte counts from GitHub', async () => {
    const fetchImpl = async url => {
      expect(url).toBe('https://api.github.com/repos/example/project/languages');
      return {
        ok: true,
        json: async () => ({ JavaScript: 750, CSS: 250 })
      };
    };

    await expect(analyzeProjectStack('https://github.com/example/project', ['React'], fetchImpl))
      .resolves.toEqual({
        stackUsage: { JavaScript: 75, CSS: 25 },
        stackUsageSource: 'github',
        stackUsageNote: 'Calculated from GitHub repository language byte counts.'
      });
  });

  it('estimates the stack from tags when there is no public GitHub repository', async () => {
    await expect(analyzeProjectStack('https://example.com/project', ['React', 'Node.js']))
      .resolves.toEqual({
        stackUsage: { React: 50, 'Node.js': 50 },
        stackUsageSource: 'tags',
        stackUsageNote: 'No public GitHub repository was available. Percentages are estimated evenly from the project tags.'
      });
  });

  it('uses tag estimates when GitHub has no language data', async () => {
    const fetchImpl = async () => ({
      ok: true,
      json: async () => ({})
    });

    await expect(analyzeProjectStack('https://github.com/example/project', ['Python', 'FastAPI'], fetchImpl))
      .resolves.toEqual({
        stackUsage: { Python: 50, FastAPI: 50 },
        stackUsageSource: 'tags',
        stackUsageNote: 'GitHub reports no language data. Percentages are estimated evenly from the project tags.'
      });
  });

  it('uses a visible tag estimate when GitHub request fails', async () => {
    const fetchImpl = async () => ({ ok: false, status: 403 });

    await expect(analyzeProjectStack('https://github.com/example/project', ['React', 'CSS'], fetchImpl))
      .resolves.toEqual({
        stackUsage: { React: 50, CSS: 50 },
        stackUsageSource: 'tags',
        stackUsageNote: 'GitHub returned 403; repository language data is unavailable. Percentages are estimated evenly from the project tags.'
      });
  });

  it('reports unavailable analysis when neither GitHub data nor tags are available', async () => {
    const fetchImpl = async () => ({ ok: false, status: 403 });

    await expect(analyzeProjectStack('https://github.com/example/project', [], fetchImpl))
      .resolves.toEqual({
        stackUsage: null,
        stackUsageSource: 'unavailable',
        stackUsageNote: 'GitHub returned 403; repository language data is unavailable. Add technology tags to provide an estimate.'
      });
  });
});

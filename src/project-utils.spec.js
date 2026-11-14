import { describe, expect, it } from 'vitest';
import {
  calculateLanguagePercentages,
  estimateStackUsage,
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

describe('estimateStackUsage', () => {
  it('splits the estimate evenly while keeping the total at 100%', () => {
    const result = estimateStackUsage('React, Node.js, MongoDB');

    expect(result).toEqual({ React: 34, 'Node.js': 33, MongoDB: 33 });
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('ignores blank and duplicate stack tags', () => {
    expect(estimateStackUsage(' React, , React, Node.js ')).toEqual({ React: 50, 'Node.js': 50 });
  });
});

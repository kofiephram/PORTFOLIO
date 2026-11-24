import { describe, expect, it } from 'vitest';
import {
  fetchGitHubProject,
  rankRepositoryImageCandidates
} from './github-import.js';

describe('rankRepositoryImageCandidates', () => {
  it('prefers likely screenshots and excludes logos, generated folders, and oversized files', () => {
    const candidates = rankRepositoryImageCandidates([
      { type: 'blob', path: 'assets/app-logo.png', size: 1200 },
      { type: 'blob', path: 'public/preview-dashboard.png', size: 2400 },
      { type: 'blob', path: 'docs/overview.jpg', size: 1800 },
      { type: 'blob', path: 'dist/screenshot.png', size: 900 },
      { type: 'blob', path: 'screenshots/large-demo.png', size: 6 * 1024 * 1024 },
      { type: 'blob', path: 'src/App.jsx', size: 800 }
    ], 'example', 'project', 'main');

    expect(candidates.map(candidate => candidate.path)).toEqual([
      'public/preview-dashboard.png',
      'docs/overview.jpg'
    ]);
    expect(candidates[0].url).toBe(
      'https://raw.githubusercontent.com/example/project/main/public/preview-dashboard.png'
    );
  });
});

describe('fetchGitHubProject', () => {
  it('imports public project metadata, languages, topics, homepage, and image candidates', async () => {
    const fetchImpl = async url => {
      if (url === 'https://api.github.com/repos/example/project') {
        return {
          ok: true,
          json: async () => ({
            private: false,
            name: 'project',
            description: 'A project description',
            html_url: 'https://github.com/example/project',
            homepage: 'https://project.vercel.app',
            topics: ['portfolio', 'react'],
            default_branch: 'main'
          })
        };
      }
      if (url === 'https://api.github.com/repos/example/project/git/trees/main?recursive=1') {
        return {
          ok: true,
          json: async () => ({
            truncated: false,
            tree: [{ type: 'blob', path: 'screenshots/homepage.png', size: 2048 }]
          })
        };
      }
      if (url === 'https://api.github.com/repos/example/project/languages') {
        return {
          ok: true,
          json: async () => ({ JavaScript: 500, CSS: 100 })
        };
      }
      throw new Error(`Unexpected request: ${url}`);
    };

    await expect(fetchGitHubProject('https://github.com/example/project', fetchImpl))
      .resolves.toMatchObject({
        title: 'project',
        description: 'A project description',
        repoUrl: 'https://github.com/example/project',
        demoUrl: 'https://project.vercel.app/',
        tags: ['JavaScript', 'CSS', 'portfolio', 'react'],
        imageCandidates: [{
          path: 'screenshots/homepage.png',
          url: 'https://raw.githubusercontent.com/example/project/main/screenshots/homepage.png'
        }],
        note: ''
      });
  });

  it('rejects invalid URLs and private repositories', async () => {
    await expect(fetchGitHubProject('https://example.com/project'))
      .rejects.toThrow('Enter a valid public GitHub repository URL.');

    await expect(fetchGitHubProject('https://github.com/example/private', async () => ({
      ok: true,
      json: async () => ({ private: true })
    }))).rejects.toThrow('Only public GitHub repositories can be imported.');
  });

  it('reports language import failures while still preserving other repository details', async () => {
    const fetchImpl = async url => {
      if (url === 'https://api.github.com/repos/example/project') {
        return {
          ok: true,
          json: async () => ({
            private: false,
            name: 'project',
            html_url: 'https://github.com/example/project',
            default_branch: 'main',
            topics: ['react']
          })
        };
      }
      if (url === 'https://api.github.com/repos/example/project/git/trees/main?recursive=1') {
        return { ok: true, json: async () => ({ tree: [], truncated: false }) };
      }
      if (url === 'https://api.github.com/repos/example/project/languages') {
        return { ok: false, status: 403 };
      }
      throw new Error(`Unexpected request: ${url}`);
    };

    await expect(fetchGitHubProject('https://github.com/example/project', fetchImpl))
      .resolves.toMatchObject({
        tags: ['react'],
        note: 'Repository language tags could not be imported: GitHub rate limit reached. Try importing again later.'
      });
  });
});

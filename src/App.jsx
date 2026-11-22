import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { analyzeProjectStack } from './project-utils.js';
import {
  isSupabaseConfigured,
  oauthCallbackErrorMessage,
  PROJECT_IMAGES_BUCKET,
  supabase
} from './supabase.js';
import { 
  Code2, 
  GraduationCap, 
  FolderGit2, 
  PlusCircle, 
  Mail, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Terminal, 
  Sparkles, 
  Menu, 
  X, 
  Trash2, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Briefcase,
  Sliders,
  LogIn,
  LogOut,
  UserPlus,
  Phone,
  Pencil,
  AlertTriangle
} from 'lucide-react';

const INITIAL_PROJECTS = [];
const PROJECT_FORM_AFTER_LOGIN_KEY = 'portfolio-open-project-form-after-login';

const DEVICON_SLUGS = {
  arduino: 'arduino',
  c: 'c',
  'c#': 'csharp',
  'c++': 'cplusplus',
  css: 'css3',
  'css3': 'css3',
  django: 'django',
  fastapi: 'fastapi',
  firebase: 'firebase',
  flask: 'flask',
  html: 'html5',
  html5: 'html5',
  java: 'java',
  javascript: 'javascript',
  kotlin: 'kotlin',
  mongodb: 'mongodb',
  'microsoft sql server': 'mssql',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  postgis: 'postgresql',
  postgresql: 'postgresql',
  python: 'python',
  react: 'react',
  'react native': 'react',
  reactnative: 'react',
  sqlite: 'sqlite',
  'sql server': 'mssql',
  supabase: 'supabase',
  'tailwind css': 'tailwindcss',
  tailwindcss: 'tailwindcss',
  typescript: 'typescript'
};

const PROFILE_SKILL_GROUPS = [
  {
    title: 'Languages',
    skills: ['Python', 'JavaScript', 'Kotlin', 'Java', 'C', 'C++', 'C#', 'HTML', 'CSS']
  },
  {
    title: 'Frameworks & APIs',
    skills: ['React', 'Next.js', 'React Native', 'FastAPI', 'Flask', 'Django', 'Node.js', 'Tailwind CSS', 'REST APIs']
  },
  {
    title: 'Data & Cloud',
    skills: ['PostgreSQL', 'PostGIS', 'SQLite', 'Microsoft SQL Server', 'MongoDB', 'Supabase', 'Firebase']
  },
  {
    title: 'IT & Tools',
    skills: ['Networking Fundamentals', 'Hardware Troubleshooting', 'Office 365', 'Git / GitHub', 'Vercel', 'Netlify', 'VS Code', 'Android Studio', 'Arduino / Robotics']
  }
];

const StackTechIcon = ({ technology }) => {
  const [hasIconError, setHasIconError] = useState(false);
  const slug = DEVICON_SLUGS[technology.toLowerCase()];
  if (!slug || hasIconError) return <Code2 className="h-4 w-4" />;

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
      alt=""
      className="h-4 w-4 object-contain"
      onError={() => setHasIconError(true)}
    />
  );
};

const mapSupabaseProject = project => {
  const imagePaths = Array.isArray(project.image_paths) ? project.image_paths : [];
  const storedImages = Array.isArray(project.images) && project.images.length
    ? project.images
    : imagePaths;
  const images = storedImages
    .filter(image => typeof image === 'string' && image.trim())
    .map(image => /^https?:\/\//i.test(image)
      ? image
      : supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(image).data.publicUrl);

  return {
    ...project,
    tags: Array.isArray(project.tags) ? project.tags : [],
    images,
    imageCredits: Array.isArray(project.image_credits) ? project.image_credits : [],
    imagePaths,
    isSupabaseProject: true
  };
};

const sortProjectsByCreatedAt = projects => [...projects].sort(
  (left, right) => (Date.parse(right.created_at) || 0) - (Date.parse(left.created_at) || 0)
);

const StackAnalysis = ({ project }) => {
  const stackUsage = project.stackUsage;
  const tags = stackUsage ? Object.keys(stackUsage) : [];
  const hasPercentages = tags.length > 0 && tags.every(tag => Number.isFinite(stackUsage?.[tag]));
  const isAnalysisUnavailable = project.stackUsageSource === 'unavailable';

  return (
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Stack analysis</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            {project.stackUsageSource === 'github'
              ? 'Language percentages from GitHub'
              : project.stackUsageSource === 'tags'
                ? 'Estimated from declared project technologies'
                : isAnalysisUnavailable
                  ? 'Stack analysis unavailable'
                  : 'Analyzing project stack'}
          </p>
        </div>
        {tags.length > 0 && (
          <div className="stack-orbit" aria-label={`${tags.length} project technology icons orbiting`}>
            <div className="stack-orbit-track" />
            <div className="stack-orbit-center"><Layers className="h-5 w-5" /></div>
            {tags.map((tag, index) => {
              const angle = (index * 2 * Math.PI) / Math.max(tags.length, 1) - Math.PI / 2;
              return (
                <span
                  key={tag}
                  className="stack-orbit-icon"
                  style={{
                    '--orbit-x': `${48 * Math.cos(angle)}px`,
                    '--orbit-y': `${48 * Math.sin(angle)}px`,
                    animationDelay: `-${index * (12 / Math.max(tags.length, 1))}s`
                  }}
                  title={tag}
                  aria-label={tag}
                >
                  <StackTechIcon technology={tag} />
                </span>
              );
            })}
          </div>
        )}
      </div>

      {hasPercentages ? (
        <div className="mt-4 space-y-3">
          {tags.map(tag => {
            const percentage = stackUsage[tag];
            return (
              <div key={tag}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-slate-300">{tag}</span>
                  <span className="shrink-0 font-semibold text-[#1e90ff]">{percentage}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#1e90ff] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          {isAnalysisUnavailable
            ? 'Percentages are unavailable until project technology tags are added.'
            : 'Analyzing project stack...'}
        </p>
      )}
      {project.stackUsageNote && (
        <p className="mt-3 text-[11px] text-slate-500">{project.stackUsageNote}</p>
      )}
    </div>
  );
};

const OverallStackAnalysis = ({ projects }) => {
  const technologyTotals = new Map();

  projects.forEach(project => {
    const projectTechnologies = new Set(
      (Array.isArray(project.tags) ? project.tags : [])
        .filter(tag => typeof tag === 'string' && tag.trim())
        .map(tag => tag.trim())
    );
    const normalizedTechnologies = new Set(
      [...projectTechnologies].map(technology => technology.toLowerCase())
    );

    normalizedTechnologies.forEach(normalizedTechnology => {
      const name = [...projectTechnologies].find(
        technology => technology.toLowerCase() === normalizedTechnology
      );
      const current = technologyTotals.get(normalizedTechnology) || {
        name,
        projectCount: 0
      };
      current.projectCount += 1;
      technologyTotals.set(normalizedTechnology, current);
    });
  });

  const technologies = Array.from(technologyTotals.values())
    .sort((left, right) => right.projectCount - left.projectCount || left.name.localeCompare(right.name));
  const orbitTechnologies = technologies.slice(0, 6);
  const githubAnalyzedProjects = projects.filter(project => project.stackUsageSource === 'github').length;

  return (
    <section aria-labelledby="overall-stack-title" className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-8">
      <div className="grid items-center gap-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" /> Portfolio technology overview
          </div>
          <h2 id="overall-stack-title" className="mt-3 text-xl font-bold text-white">
            Overall stack analysis
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Technology coverage across all projects. Percentages show the share of projects tagged with each technology.
          </p>
          <div aria-live="polite" className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
              {projects.length} total projects
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
              {technologies.length} distinct technologies
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
              {githubAnalyzedProjects} GitHub language analyses
            </span>
          </div>

          {technologies.length > 0 ? (
            <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {technologies.map(technology => {
                const coverage = projects.length
                  ? Math.round((technology.projectCount / projects.length) * 100)
                  : 0;
                return (
                  <div key={technology.name}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-slate-300">{technology.name}</span>
                      <span className="shrink-0 text-slate-500">
                        {technology.projectCount}/{projects.length} projects · {coverage}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-slate-800"
                      role="img"
                      aria-label={`${technology.name} appears in ${coverage}% of projects`}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ width: `${coverage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Add technology tags to projects to build the overall stack analysis.
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="stack-orbit" aria-label={`${orbitTechnologies.length} most common project technologies orbiting`}>
            <div className="stack-orbit-track" />
            <div className="stack-orbit-center"><Code2 className="h-5 w-5" /></div>
            {orbitTechnologies.map((technology, index) => {
              const angle = (index * 2 * Math.PI) / Math.max(orbitTechnologies.length, 1) - Math.PI / 2;
              return (
                <span
                  key={technology.name}
                  className="stack-orbit-icon"
                  style={{
                    '--orbit-x': `${48 * Math.cos(angle)}px`,
                    '--orbit-y': `${48 * Math.sin(angle)}px`,
                    animationDelay: `-${index * (12 / Math.max(orbitTechnologies.length, 1))}s`
                  }}
                  title={technology.name}
                  aria-label={technology.name}
                >
                  <StackTechIcon technology={technology.name} />
                </span>
              );
            })}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Most common technologies</span>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(!isSupabaseConfigured);
  const [projectStorageNotice, setProjectStorageNotice] = useState(
    isSupabaseConfigured
      ? ''
      : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to publish projects.'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(Boolean(oauthCallbackErrorMessage));
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState(oauthCallbackErrorMessage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSideDrawer, setActiveSideDrawer] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [imageFileNames, setImageFileNames] = useState({});
  const [imageUploadError, setImageUploadError] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const imageFileInputs = useRef({});
  const imageFiles = useRef({});
  const projectAnalysisInProgress = useRef(new Set());

  // Form state for adding a new project
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    link: '',
    img1: '',
    img2: '',
    img3: '',
    tags: ''
  });

  // Carousel Image Index Tracker per Project
  const [activeImageIndices, setActiveImageIndices] = useState({});

  useEffect(() => {
    let isMounted = true;
    if (!supabase) {
      return () => { isMounted = false; };
    }

    if (oauthCallbackErrorMessage) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const projectChangesDuringLoad = new Map();
    const loadAdminStatus = async user => {
      if (!isMounted) return;
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('portfolio_admins')
        .select('admin_email')
        .ilike('admin_email', user.email || '')
        .maybeSingle();
      if (!isMounted) return;
      if (error) {
        setIsAdmin(false);
        setProjectStorageNotice(`Could not check admin access: ${error.message}`);
        if (sessionStorage.getItem(PROJECT_FORM_AFTER_LOGIN_KEY) === 'true') {
          setAdminLoginError(`Could not verify admin access: ${error.message}`);
          setIsAdminLoginOpen(true);
        }
        return;
      }
      const hasAdminAccess = Boolean(data);
      setIsAdmin(hasAdminAccess);
      if (sessionStorage.getItem(PROJECT_FORM_AFTER_LOGIN_KEY) === 'true') {
        sessionStorage.removeItem(PROJECT_FORM_AFTER_LOGIN_KEY);
        if (hasAdminAccess) {
          setIsAdminLoginOpen(false);
          setIsModalOpen(true);
        } else {
          setAdminLoginError('This Google account is not configured as the portfolio administrator.');
          setIsAdminLoginOpen(true);
        }
      }
    };

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        return loadAdminStatus(data.session?.user);
      })
      .catch(error => {
        if (isMounted) setProjectStorageNotice(`Could not restore the admin session: ${error.message}`);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => loadAdminStatus(session?.user), 0);
    });

    const projectChannel = supabase
      .channel('portfolio-project-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, payload => {
        if (!isMounted) return;

        if (payload.eventType === 'DELETE') {
          if (payload.old?.id) projectChangesDuringLoad.set(payload.old.id, null);
          setProjects(current => current.filter(project => project.id !== payload.old.id));
          return;
        }

        if (payload.new?.id) {
          const updatedProject = mapSupabaseProject(payload.new);
          projectChangesDuringLoad.set(updatedProject.id, updatedProject);
          setProjects(current => sortProjectsByCreatedAt([
            updatedProject,
            ...current.filter(project => project.id !== updatedProject.id)
          ]));
        }
      })
      .subscribe(status => {
        if (isMounted && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
          setProjectStorageNotice(`Live Supabase project sync failed (${status}). Refresh to load the latest projects.`);
        }
      });

    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!isMounted) return;
        const savedProjects = (data || []).map(mapSupabaseProject);
        setProjects(current => {
          const projectsById = new Map(savedProjects.map(project => [project.id, project]));
          current.forEach(project => projectsById.set(project.id, project));
          projectChangesDuringLoad.forEach((project, id) => {
            if (project) projectsById.set(id, project);
            else projectsById.delete(id);
          });
          return sortProjectsByCreatedAt([...projectsById.values(), ...INITIAL_PROJECTS]);
        });
        setProjectStorageNotice('');
      })
      .catch(error => {
        if (isMounted) {
          setProjects(INITIAL_PROJECTS);
          setProjectStorageNotice(`Projects could not be loaded from Supabase: ${error.message}`);
        }
      })
      .finally(() => {
        if (isMounted) setIsProjectsLoaded(true);
      });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      supabase.removeChannel(projectChannel);
    };
  }, []);

  useEffect(() => {
    if (!isProjectsLoaded) return;
    const projectsToAnalyze = projects.filter(project =>
      !project.stackUsageSource && !projectAnalysisInProgress.current.has(project.id)
    );
    if (!projectsToAnalyze.length) return;

    projectsToAnalyze.forEach(project => projectAnalysisInProgress.current.add(project.id));
    Promise.all(projectsToAnalyze.map(async project => [
      project.id,
      await analyzeProjectStack(project.link, project.tags)
    ]))
      .then(analyses => {
        const analysisById = new Map(analyses);
        setProjects(previousProjects => previousProjects.map(project => {
          const analysis = analysisById.get(project.id);
          return analysis && !project.stackUsageSource ? { ...project, ...analysis } : project;
        }));
      })
      .finally(() => {
        projectsToAnalyze.forEach(project => projectAnalysisInProgress.current.delete(project.id));
      });
  }, [projects, isProjectsLoaded]);

  const handleScreenshotFileChange = (field, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Choose a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Each image must be 5 MB or smaller.');
      return;
    }

    setImageUploadError('');
    const previousPreview = newProject[field];
    if (previousPreview) URL.revokeObjectURL(previousPreview);
    imageFiles.current[field] = file;
    setNewProject(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    setImageFileNames(prev => ({ ...prev, [field]: file.name }));
  };

  const handleRemoveScreenshot = field => {
    const preview = newProject[field];
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    delete imageFiles.current[field];
    setNewProject(prev => ({ ...prev, [field]: '' }));
    setImageFileNames(prev => ({ ...prev, [field]: '' }));
    setImageUploadError('');
  };

  const handleNextImage = (projectId, totalImages) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % totalImages
    }));
  };

  const handlePrevImage = (projectId, totalImages) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (isAddingProject) return;
    if (!supabase || !isAdmin) {
      setProjectStorageNotice('Sign in with a portfolio admin account before publishing projects.');
      return;
    }
    if (!newProject.title.trim() || !newProject.description.trim()) {
      setProjectStorageNotice('Enter a project title and description before publishing.');
      return;
    }

    const tagArray = Array.from(new Set(
      newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    ));
    if (!tagArray.length) {
      setProjectStorageNotice('Add at least one technology to the project stack.');
      return;
    }
    const filesByField = ['img1', 'img2', 'img3']
      .map(field => ({ file: imageFiles.current[field] }))
      .filter(({ file }) => Boolean(file));
    const existingImages = ['img1', 'img2', 'img3']
      .filter(field => /^https?:\/\//i.test(newProject[field]))
      .map(field => newProject[field]);
    if (!filesByField.length && !existingImages.length) {
      setImageUploadError('Upload at least one project screenshot to publish it permanently.');
      return;
    }

    setIsAddingProject(true);
    setImageUploadError('');
    setProjectStorageNotice('');
    const uploadedPaths = [];

    try {
      const projectId = editingProject?.id || crypto.randomUUID();
      const images = [...existingImages];
      for (const { file } of filesByField) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${projectId}/${crypto.randomUUID()}-${safeFileName}`;
        const { error: uploadError } = await supabase.storage
          .from(PROJECT_IMAGES_BUCKET)
          .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
        if (uploadError) throw uploadError;

        uploadedPaths.push(path);
        const { data } = supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(path);
        images.push(data.publicUrl);
      }
      const retainedExistingPaths = editingProject
        ? ['img1', 'img2', 'img3']
          .filter(field => /^https?:\/\//i.test(newProject[field]))
          .map(field => {
            const fieldIndex = ['img1', 'img2', 'img3'].indexOf(field);
            return editingProject.imagePaths[fieldIndex];
          })
          .filter(Boolean)
        : [];
      const projectValues = {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        link: newProject.link.trim(),
        tags: tagArray,
        images,
        image_paths: [...retainedExistingPaths, ...uploadedPaths]
      };

      const projectQuery = editingProject
        ? supabase.from('projects').update(projectValues).eq('id', editingProject.id)
        : supabase.from('projects').insert({ id: projectId, ...projectValues });
      const { data, error } = await projectQuery.select().single();
      if (error) throw error;

      const savedProject = mapSupabaseProject(data);
      setProjects(prev => editingProject
        ? sortProjectsByCreatedAt([savedProject, ...prev.filter(project => project.id !== savedProject.id)])
        : sortProjectsByCreatedAt([savedProject, ...prev]));

      if (editingProject) {
        const retainedPathSet = new Set(retainedExistingPaths);
        const removedPaths = (editingProject.imagePaths || [])
          .filter(path => !retainedPathSet.has(path));
        if (removedPaths.length) {
          await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove(removedPaths);
        }
      }

      Object.values(newProject).forEach(value => {
        if (typeof value === 'string' && value.startsWith('blob:')) URL.revokeObjectURL(value);
      });
      imageFiles.current = {};
      setNewProject({ title: '', description: '', link: '', img1: '', img2: '', img3: '', tags: '' });
      setImageFileNames({});
      setEditingProject(null);
      setIsModalOpen(false);
    } catch (error) {
      let cleanupNotice = '';
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage
          .from(PROJECT_IMAGES_BUCKET)
          .remove(uploadedPaths);
        if (cleanupError) cleanupNotice = ` Image cleanup also failed: ${cleanupError.message}`;
      }
      setProjectStorageNotice(`Could not publish the project: ${error.message || 'Unknown Supabase error.'}${cleanupNotice}`);
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleOpenProjectManager = () => {
    if (!isSupabaseConfigured) {
      setProjectStorageNotice('Configure Supabase in .env.local before publishing projects.');
      return;
    }
    if (isAdmin) {
      setEditingProject(null);
      resetProjectForm();
      setIsModalOpen(true);
      return;
    }
    sessionStorage.setItem(PROJECT_FORM_AFTER_LOGIN_KEY, 'true');
    setAdminLoginError('');
    setIsAdminLoginOpen(true);
  };

  const handleOpenProjectEditor = project => {
    if (!isAdmin || !project.isSupabaseProject) return;
    resetProjectForm();
    setEditingProject(project);
    setNewProject({
      title: project.title,
      description: project.description,
      link: project.link || '',
      img1: project.images[0] || '',
      img2: project.images[1] || '',
      img3: project.images[2] || '',
      tags: project.tags.join(', ')
    });
    setImageFileNames({
      img1: project.images[0] ? 'Existing screenshot 1' : '',
      img2: project.images[1] ? 'Existing screenshot 2' : '',
      img3: project.images[2] ? 'Existing screenshot 3' : ''
    });
    setIsModalOpen(true);
  };

  const handleCloseAdminLogin = () => {
    sessionStorage.removeItem(PROJECT_FORM_AFTER_LOGIN_KEY);
    setIsAdminLoginOpen(false);
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setAdminLoginError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      setAdminLoginError(error.message || 'Google sign-in failed.');
    }
  };

  const handleAdminLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setProjectStorageNotice(`Could not sign out: ${error.message}`);
      return;
    }
    setIsAdmin(false);
  };

  const handleDeleteProject = async project => {
    setProjectPendingDelete(project);
  };

  const confirmDeleteProject = async () => {
    const project = projectPendingDelete;
    if (!supabase || !isAdmin || !project.isSupabaseProject) return;
    setIsDeletingProject(true);
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      setProjectStorageNotice(`Could not delete the project: ${error.message}`);
      setIsDeletingProject(false);
      setProjectPendingDelete(null);
      return;
    }

    setProjects(prev => prev.filter(item => item.id !== project.id));
    if (project.imagePaths?.length) {
      const { error: storageError } = await supabase.storage
        .from(PROJECT_IMAGES_BUCKET)
        .remove(project.imagePaths);
      if (storageError) {
        setProjectStorageNotice(`Project deleted, but its stored images could not be removed: ${storageError.message}`);
        setIsDeletingProject(false);
        setProjectPendingDelete(null);
        return;
      }
    }
    setProjectStorageNotice('');
    setIsDeletingProject(false);
    setProjectPendingDelete(null);
  };

  const resetProjectForm = () => {
    Object.values(newProject).forEach(value => {
      if (typeof value === 'string' && value.startsWith('blob:')) URL.revokeObjectURL(value);
    });
    imageFiles.current = {};
    setNewProject({ title: '', description: '', link: '', img1: '', img2: '', img3: '', tags: '' });
    setImageFileNames({});
    setImageUploadError('');
    setEditingProject(null);
  };

  useEffect(() => {
    const hasOpenModal = isModalOpen || isAdminLoginOpen || Boolean(projectPendingDelete);
    if (!hasOpenModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = event => {
      if (event.key !== 'Escape') return;
      if (projectPendingDelete) {
        setProjectPendingDelete(null);
      } else if (isAdminLoginOpen) {
        sessionStorage.removeItem(PROJECT_FORM_AFTER_LOGIN_KEY);
        setIsAdminLoginOpen(false);
      } else if (isModalOpen && !isAddingProject) {
        Object.values(newProject).forEach(value => {
          if (typeof value === 'string' && value.startsWith('blob:')) URL.revokeObjectURL(value);
        });
        imageFiles.current = {};
        setNewProject({ title: '', description: '', link: '', img1: '', img2: '', img3: '', tags: '' });
        setImageFileNames({});
        setImageUploadError('');
        setEditingProject(null);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen, isAdminLoginOpen, projectPendingDelete, isAddingProject, newProject]);

  const allTags = ["All", ...Array.from(new Set(projects.flatMap(p => p.tags)))];

  const filteredProjects = selectedTag === "All" 
    ? projects 
    : projects.filter(p => p.tags.includes(selectedTag));

  return (
    <div className="portfolio-page min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[128px] pointer-events-none" />

      {/* Modern Fixed Navigation Bar */}
      <nav className="sticky top-0 pt-[0.33cm] z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent font-bold">
                Ephraim Kofi
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-auto md:flex md:items-center md:justify-end gap-4 lg:gap-8 text-sm font-medium text-slate-300">
              <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
              
              <button 
                onClick={handleOpenProjectManager}
                disabled={!isProjectsLoaded}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isAdmin ? <PlusCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                Add Project
              </button>
              {isAdmin && (
                <button onClick={handleAdminLogout} className="text-xs text-slate-400 hover:text-white">
                  <LogOut className="mr-1 inline h-3 w-3" /> Sign out
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  disabled
                  title="This portfolio is limited to one administrator."
                  className="inline-flex cursor-not-allowed items-center gap-1 text-xs text-slate-400 opacity-40"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add admin
                </button>
              )}
            </div>

            {/* Mobile Side Feature Drawer Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setActiveSideDrawer(!activeSideDrawer)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-800 transition"
                title="Toggle Dev Terminal Drawer"
              >
                <Sliders className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Main Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
            <a 
              href="#home" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-cyan-400 transition"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-cyan-400 transition"
            >
              About
            </a>
            <a 
              href="#projects" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-cyan-400 transition"
            >
              Projects ({projects.length})
            </a>
            <a 
              href="#contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-cyan-400 transition"
            >
              Contact
            </a>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); handleOpenProjectManager(); }}
              disabled={!isProjectsLoaded}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md shadow-cyan-500/20"
            >
              {isAdmin ? <PlusCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              Add Project
            </button>
            {isAdmin && (
              <button onClick={handleAdminLogout} className="w-full py-2 text-sm text-slate-400 hover:text-white">
                <LogOut className="mr-1 inline h-3 w-3" /> Sign out
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                disabled
                title="This portfolio is limited to one administrator."
                className="w-full cursor-not-allowed py-2 text-sm text-slate-400 opacity-40"
              >
                <UserPlus className="mr-1 inline h-4 w-4" /> Add admin
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Interactive Mobile Side Feature Drawer (Activates on small viewports or slider button click) */}
      {activeSideDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between h-full shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2 font-semibold text-cyan-400">
                  <Terminal className="w-5 h-5" />
                  Dev Terminal & Quick Stats
                </div>
                <button onClick={() => setActiveSideDrawer(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Developer Live Terminal Widget */}
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs border border-slate-800 text-slate-300 mb-6 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-slate-500 border-b border-slate-900 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 text-[10px] text-slate-400">ephraim@harare:~</span>
                </div>
                <p className="text-emerald-400">$ status --internship</p>
                <p className="text-slate-400">Part 3 Software Engineering @ UZ</p>
                <p className="text-cyan-400 mt-2">$ list --focus</p>
                <p className="text-slate-300">Full-stack, databases, IT support & networking</p>
                <p className="text-purple-400 mt-2">$ build --active-projects</p>
                <p className="text-amber-300">{projects.length} project profiles loaded</p>
              </div>

              {/* Quick Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Quick Overview</h4>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">University</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">UZ Harare</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">Study</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">BSc Hons · Part 3</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">Location</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Harare, Zimbabwe</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSideDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition text-center"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pt-0 pb-12">
        
        {/* HERO SECTION */}
        <section id="home" className="relative pt-6 pb-12 md:pt-16 md:pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-medium shadow-xl shadow-cyan-500/5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>Part 3 Software Engineering Student · IT Intern Candidate</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Full-Stack Development &{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                IT Systems Support
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Hi, I'm <strong className="text-slate-200">Ephraim Kofi</strong>, a third-year BSc Honours Software Engineering student at the University of Zimbabwe and an IT internship candidate. I build full-stack and cross-platform applications, work with databases and APIs, and bring hands-on hardware troubleshooting and networking fundamentals.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a 
                href="#projects" 
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <FolderGit2 className="w-5 h-5" />
                Explore My Projects
              </a>
              <button 
                onClick={handleOpenProjectManager}
                disabled={!isProjectsLoaded}
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {isAdmin ? <PlusCircle className="w-5 h-5 text-cyan-400" /> : <LogIn className="w-5 h-5 text-cyan-400" />}
                Add Project
              </button>
            </div>

            <div className="pt-8 border-t border-slate-900 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
              <span className="text-slate-500 font-semibold mr-2 uppercase tracking-wider text-xs">Core Tech:</span>
                {['React / Next.js', 'React Native / Kotlin', 'Python / FastAPI / Flask', 'PostgreSQL / PostGIS / SQLite', 'Supabase / Firebase', 'Systems & Network Support'].map((tech, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
                <GraduationCap className="w-4 h-4" /> Academic & Background
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Software, Data & Reliable IT Support
              </h2>

              <p className="text-slate-300 leading-relaxed">
                I am a <strong>Part 3 BSc Honours Software Engineering student at the University of Zimbabwe</strong> (2024–present), seeking an IT internship in software development, IT support, systems administration, data management, or digital services. I have built web and mobile applications, database-backed services, and hardware projects, with a practical focus on solving local business and community needs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> University of Zimbabwe
                  </div>
                  <p className="text-xs text-slate-400">BSc Honours Software Engineering · Part 3 · Mt Pleasant, Harare</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Layers className="w-4 h-4" /> Internship Focus
                  </div>
                  <p className="text-xs text-slate-400">Software · IT support · Systems · Data</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Developer Profile</span>
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </h3>

              <div className="space-y-4">
                {PROFILE_SKILL_GROUPS.map(group => (
                  <div key={group.title}>
                    <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-400">{group.title}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map(skill => (
                        <span key={skill} className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-indigo-400">Certifications</h4>
                  <p className="mt-1 text-xs text-slate-400">ICDL Africa: Computer Essentials, Word, Excel & PowerPoint · 27 Oct 2024</p>
                  <p className="mt-1 text-xs text-slate-400">Coding & Robotics, Abedai Technologies · 26 Sep 2026</p>
                  <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400">
                    Live deployments on Netlify and Vercel, cross-platform mobile development, and practical hardware and robotics projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-cyan-500/20">
                <FolderGit2 className="w-4 h-4" /> Portfolio Showcase
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Featured Software Works
              </h2>
            </div>

            <button
              onClick={handleOpenProjectManager}
              disabled={!isProjectsLoaded}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 font-medium hover:bg-cyan-500/10 transition shadow-lg shadow-cyan-500/5 self-start md:self-auto"
            >
              {isAdmin ? <PlusCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              Add Project
            </button>
          </div>

          {projectStorageNotice && (
            <p role="status" className="text-sm text-amber-300">{projectStorageNotice}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedTag === tag
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {!isProjectsLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-label="Loading projects">
              {[0, 1].map(index => (
                <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="aspect-video bg-slate-800" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded bg-slate-800" />
                    <div className="h-3 w-full rounded bg-slate-800" />
                    <div className="h-3 w-4/5 rounded bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
              <FolderGit2 className="mx-auto h-8 w-8 text-slate-600" />
              <h3 className="mt-3 font-semibold text-slate-200">
                {projects.length === 0 ? 'No projects published yet' : 'No projects match this technology'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {projects.length === 0 ? 'The admin can publish the first project from the Add Project button.' : 'Choose another technology filter.'}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => {
              const currentImageIndex = activeImageIndices[project.id] || 0;
              const hasMultipleImages = project.images && project.images.length > 1;

              return (
                <div 
                  key={project.id}
                  className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Project Image Carousel Header */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img 
                        src={project.images[currentImageIndex]} 
                        alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80";
                        }}
                      />
                      {project.imageCredits?.[currentImageIndex]?.sourceUrl && (
                        <a
                          href={project.imageCredits[currentImageIndex].sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={`Image by ${project.imageCredits[currentImageIndex].creator} · ${project.imageCredits[currentImageIndex].license}`}
                          className="absolute bottom-3 left-3 z-10 max-w-[70%] truncate rounded bg-slate-950/80 px-2 py-1 text-[10px] text-slate-200 hover:text-cyan-300"
                        >
                          {project.imageCredits[currentImageIndex].creator} · {project.imageCredits[currentImageIndex].license}
                        </a>
                      )}

                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {isAdmin && project.isSupabaseProject && (
                          <>
                            <button
                              onClick={() => handleOpenProjectEditor(project)}
                              className="p-1.5 rounded-lg bg-slate-950/70 text-slate-400 hover:text-cyan-400 border border-slate-800 backdrop-blur-md transition"
                              title="Edit Project"
                              aria-label={`Edit ${project.title}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project)}
                              className="p-1.5 rounded-lg bg-slate-950/70 text-slate-400 hover:text-red-400 border border-slate-800 backdrop-blur-md transition"
                              title="Delete Project"
                              aria-label={`Delete ${project.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={() => handlePrevImage(project.id, project.images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-slate-200 hover:bg-slate-950 border border-slate-800 backdrop-blur-md transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleNextImage(project.id, project.images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-slate-200 hover:bg-slate-950 border border-slate-800 backdrop-blur-md transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800">
                            {project.images.map((_, idx) => (
                              <span 
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === currentImageIndex ? "bg-cyan-400 w-4" : "bg-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
                          {project.title}
                        </h3>
                        {project.link && project.link !== "#" && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition flex-shrink-0"
                            title="Open Project Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 text-cyan-300 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <StackAnalysis project={project} />
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Globe className="w-3.5 h-3.5" /> Web Application
                    </span>
                    {project.link && project.link !== "#" ? (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600 italic">No external link provided</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="scroll-mt-24">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider border border-cyan-500/20">
              <Mail className="w-4 h-4" /> Get In Touch
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              Let's Build Something Great Together
            </h2>
            
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              I am open to software engineering internships, collaborative development, and technical project inquiries.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a 
                href="mailto:kofiephram@gmail.com"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Ephraim
              </a>
              <a
                href="tel:+263777536989"
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Ephraim
              </a>
              <a 
                href="https://github.com/kofiephram"
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium transition flex items-center gap-2"
              >
                <FolderGit2 className="w-4 h-4" /> GitHub Profile
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 mt-20 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Ephraim Kofi · Part 3 Software Engineering · Harare, Zimbabwe</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/kofiephram" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">GitHub</a>
            <a href="mailto:kofiephram@gmail.com" className="hover:text-cyan-400 transition">Email</a>
            <a href="tel:+263777536989" className="hover:text-cyan-400 transition">Call</a>
          </div>
        </div>
        <OverallStackAnalysis projects={projects} />
      </footer>

      {/* ADD PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div id="project-form-title" className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <PlusCircle className="w-5 h-5" />
                {editingProject ? 'Edit Software Project' : 'Add New Software Project'}
              </div>
              <button 
                onClick={() => { resetProjectForm(); setIsModalOpen(false); }}
                disabled={isAddingProject}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {projectStorageNotice && (
              <p role="alert" className="text-sm text-amber-300">{projectStorageNotice}</p>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. UZ Automated Timetable Generator"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Project Website / Repository Link
                </label>
                <input 
                  type="url" 
                  placeholder="https://github.com/ephraimkofi/my-project"
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Brief Information (What does this web app do?) *
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe the functionality, tech stack, and purpose of this web application..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Project Preview Screenshots (1 to 3 images) *
                </label>
                <p className="text-[11px] text-slate-500">
                  Selected images are uploaded to Supabase Storage. JPG, PNG, WebP, or GIF; maximum 5 MB each.
                </p>
                {[
                  { field: 'img1', label: 'Choose primary screenshot' },
                  { field: 'img2', label: 'Choose feature preview' },
                  { field: 'img3', label: 'Choose dashboard / UI view' }
                ].map(({ field, label }, index) => (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <input
                        ref={node => { imageFileInputs.current[field] = node; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        aria-label={`Choose image ${index + 1}`}
                        onChange={(e) => handleScreenshotFileChange(field, e)}
                      />
                      <button
                        type="button"
                        onClick={() => imageFileInputs.current[field]?.click()}
                        className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-left text-xs text-cyan-300 hover:bg-slate-700 transition"
                        aria-label={label}
                        title="Choose an image from your files"
                      >
                        <PlusCircle className="h-4 w-4 shrink-0" />
                        <span className="truncate">{imageFileNames[field] || label}</span>
                      </button>
                      {newProject[field] && (
                        <div className="relative">
                          <img src={newProject[field]} alt={`Preview ${index + 1}`} className="h-12 w-20 rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(field)}
                            className="absolute -right-2 -top-2 rounded-full border border-slate-700 bg-slate-950 p-1 text-slate-300 hover:text-red-400"
                            aria-label={`Remove image ${index + 1}`}
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {imageUploadError && (
                  <p role="alert" className="text-xs text-red-400">{imageUploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tech Stack (Comma separated) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="React, Tailwind CSS, Python, Node.js"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Public GitHub repositories are analyzed automatically; otherwise the chart estimates an even split from these tags.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { resetProjectForm(); setIsModalOpen(false); }}
                  disabled={isAddingProject}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAddingProject || !isProjectsLoaded}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
                >
                  {isAddingProject
                    ? (editingProject ? 'Saving changes...' : 'Uploading & publishing...')
                    : (editingProject ? 'Save Changes' : 'Save & Publish Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectPendingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="delete-project-title" className="font-bold text-white">Delete this project?</h2>
                <p className="mt-2 text-sm text-slate-400">
                  <strong className="text-slate-200">{projectPendingDelete.title}</strong> and its stored screenshots will be permanently removed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectPendingDelete(null)}
                disabled={isDeletingProject}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                disabled={isDeletingProject}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {isDeletingProject ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-cyan-400">
                <LogIn className="h-5 w-5" /> Portfolio Admin
              </h2>
              <button type="button" onClick={handleCloseAdminLogin} className="text-slate-400 hover:text-white" aria-label="Close admin login">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400">
              Sign in with the portfolio administrator's Google account to add, edit, or remove projects.
            </p>
            {adminLoginError && <p role="alert" className="text-sm text-red-400">{adminLoginError}</p>}
            <button type="button" onClick={handleGoogleLogin} className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-cyan-400">
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
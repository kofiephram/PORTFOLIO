import React, { useState, useEffect } from 'react';
import './App.css';
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
  Sliders
} from 'lucide-react';

// Initial pre-populated software engineering projects for Ephraim Kofi
const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "Campus Hub - UZ Academic Portal",
    description: "A centralized real-time platform designed for University of Zimbabwe students to access course materials, collaborate on group assignments, and receive department updates efficiently.",
    link: "https://github.com/ephraimkofi/uz-campus-hub",
    tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    images: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: 2,
    title: "ZimMarketplace AI Engine",
    description: "An intelligent e-commerce recommendation system built for local tech entrepreneurs, utilizing machine learning algorithms for customized product suggestions and inventory analytics.",
    link: "https://github.com/ephraimkofi/zim-market-ai",
    tags: ["Python", "FastAPI", "React", "PostgreSQL"],
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556742049-0a67cf6004b1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSideDrawer, setActiveSideDrawer] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");

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
    const indices = {};
    projects.forEach(p => {
      indices[p.id] = 0;
    });
    setActiveImageIndices(indices);
  }, [projects]);

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

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;

    // Collect valid image URLs or provide fallback defaults
    const imagesList = [];
    if (newProject.img1) imagesList.push(newProject.img1);
    if (newProject.img2) imagesList.push(newProject.img2);
    if (newProject.img3) imagesList.push(newProject.img3);

    if (imagesList.length === 0) {
      imagesList.push("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80");
    }

    const tagArray = newProject.tags
      ? newProject.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ["Software Engineering"];

    const createdProject = {
      id: Date.now(),
      title: newProject.title,
      description: newProject.description,
      link: newProject.link || "#",
      tags: tagArray,
      images: imagesList
    };

    setProjects([createdProject, ...projects]);
    setNewProject({ title: '', description: '', link: '', img1: '', img2: '', img3: '', tags: '' });
    setIsModalOpen(false);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Ephraim Kofi
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add Project
              </button>
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
              onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true); }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md shadow-cyan-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Project
            </button>
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
                  <span className="ml-2 text-[10px] text-slate-400">ephraim@uz-dev-box:~</span>
                </div>
                <p className="text-emerald-400">$ status --student</p>
                <p className="text-slate-400">Software Engineering undergrad @ UZ</p>
                <p className="text-cyan-400 mt-2">$ list --skills</p>
                <p className="text-slate-300">Python, React, Node.js, C++, Web Architecture</p>
                <p className="text-purple-400 mt-2">$ build --active-projects</p>
                <p className="text-amber-300">{projects.length} showcase items loaded</p>
              </div>

              {/* Quick Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Quick Overview</h4>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">University</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">UZ Harare</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">Major</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">BSc Software Eng.</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-300">Focus</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Full-Stack & Systems</span>
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
              <span>Software Engineering Student @ University of Zimbabwe</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Crafting Digital Solutions with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Clean Architecture & Code
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Hi, I'm <strong className="text-slate-200">Ephraim Kofi</strong>. I build responsive web systems, scalable software, and modern digital platforms focused on real-world practical utility.
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
                onClick={() => setIsModalOpen(true)}
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Add New Software Work
              </button>
            </div>

            <div className="pt-8 border-t border-slate-900 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
              <span className="text-slate-500 font-semibold mr-2 uppercase tracking-wider text-xs">Core Tech:</span>
              {['JavaScript / React', 'Python & FastAPI', 'Node.js', 'PostgreSQL / MongoDB', 'Tailwind CSS', 'Git & CI/CD'].map((tech, idx) => (
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
                Engineering Software for Impact & Performance
              </h2>

              <p className="text-slate-300 leading-relaxed">
                As a passionate Software Engineering undergraduate at the <strong>University of Zimbabwe (UZ)</strong>, I focus on synthesizing robust web development techniques with software design patterns. My focus centers on full-stack architecture, API development, and data-driven client applications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> University of Zimbabwe
                  </div>
                  <p className="text-xs text-slate-400">Department of Computer Science & Engineering</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Layers className="w-4 h-4" /> Project Methodology
                  </div>
                  <p className="text-xs text-slate-400">Agile, Modular Design & Clean Code Practices</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Developer Profile</span>
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Frontend Engineering (React / Next.js)</span>
                    <span className="text-cyan-400 font-bold">90%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-cyan-400 h-2 rounded-full w-[90%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Backend & APIs (Node / Python)</span>
                    <span className="text-indigo-400 font-bold">85%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-400 h-2 rounded-full w-[85%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Database Design (SQL & NoSQL)</span>
                    <span className="text-emerald-400 font-bold">80%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full w-[80%]" />
                  </div>
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 font-medium hover:bg-cyan-500/10 transition shadow-lg shadow-cyan-500/5 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Add Project Link & Images
            </button>
          </div>

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

                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1.5 rounded-lg bg-slate-950/70 text-slate-400 hover:text-red-400 border border-slate-800 backdrop-blur-md transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                href="mailto:ephraim.kofi@example.com"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Ephraim
              </a>
              <a 
                href="https://github.com" 
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
            <span>Ephraim Kofi • Software Engineering @ University of Zimbabwe</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">LinkedIn</a>
            <a href="mailto:ephraim.kofi@example.com" className="hover:text-cyan-400 transition">Email</a>
          </div>
        </div>
      </footer>

      {/* ADD PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <PlusCircle className="w-5 h-5" />
                Add New Software Project
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-left">
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
                  Project Preview Screenshots (2 to 3 Image URLs)
                </label>
                <input 
                  type="url" 
                  placeholder="Image 1 URL (Primary screenshot)"
                  value={newProject.img1}
                  onChange={(e) => setNewProject({...newProject, img1: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs transition"
                />
                <input 
                  type="url" 
                  placeholder="Image 2 URL (Feature preview)"
                  value={newProject.img2}
                  onChange={(e) => setNewProject({...newProject, img2: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs transition"
                />
                <input 
                  type="url" 
                  placeholder="Image 3 URL (Dashboard / UI view)"
                  value={newProject.img3}
                  onChange={(e) => setNewProject({...newProject, img3: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tech Stack Tags (Comma separated)
                </label>
                <input 
                  type="text" 
                  placeholder="React, Tailwind CSS, Python, Node.js"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
                >
                  Save & Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
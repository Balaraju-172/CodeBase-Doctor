import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ChevronDown, ChevronRight, Circle, FileCode2, FileText, Folder, FolderOpen, GitBranch, Info, MoreHorizontal, PanelRightClose, Search, Sparkles, WandSparkles } from 'lucide-react';
import CodeViewer from '../components/CodeViewer';
import { repositories, fileContents, fileTree } from '../data/sampleData';

const fileDetails = {
  'src/index.js': { type: 'Entry point', summary: 'Bootstraps the Express application, registers middleware and route modules, and opens the database connection before listening for requests.' },
  'src/controllers/auth.controller.js': { type: 'Controller', summary: 'Translates incoming authentication requests into service calls. The login handler sets a protected session cookie and returns a short-lived access token.' },
  'src/config/database.js': { type: 'Configuration', summary: 'Reads the database URL from the runtime environment and establishes a Mongoose connection. Startup fails fast when the connection string is missing.' },
};

const fallbacks = {
  'auth.routes.js': ['import { Router } from "express";', 'import { login } from "../controllers/auth.controller.js";', '', 'const router = Router();', '', 'router.post("/login", login);', '', 'export default router;'],
  'project.routes.js': ['import { Router } from "express";', 'import { requireAuth } from "../middleware/requireAuth.js";', '', 'const router = Router();', 'router.use(requireAuth);', 'router.get("/", listProjects);', '', 'export default router;'],
  'requireAuth.js': ['export function requireAuth(req, res, next) {', '  const token = req.cookies?.session;', '', '  if (!token) {', '    return res.status(401).json({ error: "Unauthorized" });', '  }', '', '  return next();', '}'],
  'User.js': ['import mongoose from "mongoose";', '', 'const userSchema = new mongoose.Schema({', '  email: { type: String, required: true, unique: true },', '  passwordHash: { type: String, required: true },', '}, { timestamps: true });', '', 'export default mongoose.model("User", userSchema);'],
  'auth.service.js': ['export const AuthService = {', '  async login(email, password) {', '    const user = await User.findOne({ email });', '    if (!user || !(await verifyPassword(password, user.passwordHash))) {', '      throw new Error("Invalid credentials");', '    }', '    return createSession(user);', '  },', '};'],
};

export default function RepositoryExplorer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const repo = repositories.find((item) => item.id === id) || repositories[0];
  const [selectedFile, setSelectedFile] = useState('src/index.js');
  const [expanded, setExpanded] = useState(() => new Set(['src', 'config']));
  const [treeSearch, setTreeSearch] = useState('');
  const [explanationOpen, setExplanationOpen] = useState(true);

  const lines = fileContents[selectedFile] || fallbacks[selectedFile.split('/').pop()] || ['// Sample source file', '// Select another file to explore the demo repository.'];
  const details = fileDetails[selectedFile] || { type: 'Source file', summary: 'This file is part of the sample MERN application. Explore neighboring files to understand how routes, middleware, services, and configuration fit together.' };

  function toggleFolder(name) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function renderTree(items, prefix = '') {
    return items.filter((item) => `${prefix}${item.name}`.toLowerCase().includes(treeSearch.toLowerCase()) || item.type === 'folder').map((item) => {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const open = expanded.has(path);
      if (item.type === 'folder') {
        return <div key={path}>
          <button className="tree-item folder-item" onClick={() => toggleFolder(path)}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{open ? <FolderOpen size={15} /> : <Folder size={15} />}<span>{item.name}</span></button>
          {open && <div className="tree-children">{renderTree(item.children, path)}</div>}
        </div>;
      }
      return <button key={path} className={`tree-item file-item ${selectedFile === path ? 'selected' : ''}`} onClick={() => setSelectedFile(path)}><FileCode2 size={14} /><span>{item.name}</span></button>;
    });
  }

  return (
    <div className="explorer-page">
      <div className="explorer-heading">
        <div><div className="explorer-breadcrumb"><span>Repositories</span><ChevronRight size={13} /><strong>{repo.name}</strong></div><h1>{repo.owner} <span>/</span> {repo.name}</h1></div>
        <div className="explorer-meta"><span><GitBranch size={14} />main</span><span className="demo-label"><Circle size={7} fill="currentColor" />DEMO DATA</span></div>
      </div>
      <div className="explorer-workspace">
        <aside className="explorer-files">
          <div className="explorer-pane-heading"><span>EXPLORER</span><button aria-label="Explorer options"><MoreHorizontal size={16} /></button></div>
          <div className="repo-root-row"><ChevronDown size={14} /><FolderOpen size={15} /><strong>{repo.name}</strong></div>
          <label className="tree-search"><Search size={13} /><input placeholder="Find a file..." value={treeSearch} onChange={(event) => setTreeSearch(event.target.value)} aria-label="Find a file" /></label>
          <div className="file-tree">{renderTree(fileTree)}</div>
          <div className="tree-footer"><span><GitBranch size={12} />main</span><span><Activity size={12} />MERN</span></div>
        </aside>

        <section className="explorer-code">
          <div className="file-tabs"><div className="file-tab active"><FileCode2 size={14} /><span>{selectedFile.split('/').pop()}</span><button aria-label="Close file tab">×</button></div><div className="tab-empty">{selectedFile}</div><button className="tab-more" aria-label="More file options"><MoreHorizontal size={16} /></button></div>
          <div className="code-breadcrumb"><span>{repo.name}</span><ChevronRight size={12} />{selectedFile.split('/').map((part, index, list) => <span className="crumb-piece" key={`${part}-${index}`}>{part}{index < list.length - 1 && <ChevronRight size={12} />}</span>)}</div>
          <CodeViewer lines={lines} />
          <div className="code-statusbar"><span><GitBranch size={12} />main</span><span>UTF-8</span><span>JavaScript</span><span>Ln 1, Col 1</span></div>
        </section>

        {explanationOpen ? <aside className="explainer-pane">
          <div className="explainer-header"><div><Sparkles size={15} /><span>CODE EXPLANATION</span></div><button aria-label="Close explanation panel" onClick={() => setExplanationOpen(false)}><PanelRightClose size={15} /></button></div>
          <div className="explainer-content">
            <div className="explain-file-icon"><FileText size={17} /></div>
            <span className="eyebrow">{details.type.toUpperCase()}</span>
            <h2>{selectedFile.split('/').pop()}</h2>
            <span className="file-location">{selectedFile}</span>
            <div className="explanation-callout"><span><WandSparkles size={14} />OVERVIEW</span><p>{details.summary}</p></div>
            <div className="explanation-section"><h3>In this file</h3><div className="file-point"><span className="point-dot purple" /><p><strong>{lines.length} lines</strong><span>Sample code shown for interface demonstration.</span></p></div><div className="file-point"><span className="point-dot blue" /><p><strong>Part of the {repo.name} app</strong><span>Demo repository structure, not live source code.</span></p></div></div>
            <div className="explanation-footnote"><Info size={14} /><span>Explanations are static sample content. No AI service is connected.</span></div>
          </div>
          <button className="ask-about-file" onClick={() => navigate('/chat')}><Sparkles size={14} />Ask about this file</button>
        </aside> : <button className="reopen-explainer" onClick={() => setExplanationOpen(true)}><Sparkles size={15} />Show explanation</button>}
      </div>
    </div>
  );
}

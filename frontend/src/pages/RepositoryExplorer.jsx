import RepositoryChat from '../components/RepositoryChat';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles.css";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Circle,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Info,
  MoreHorizontal,
  PanelRightClose,
  Search,
  Sparkles,
  WandSparkles
} from 'lucide-react';

import CodeViewer from '../components/CodeViewer';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';


  

// Convert GitHub flat file paths into nested folders
function buildFileTree(files) {
  const root = [];
  const folderMap = new Map();

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isLast = index === parts.length - 1;
      const isFolder = !isLast || file.type === 'folder';

      if (isFolder) {
        let folder = folderMap.get(currentPath);

        if (!folder) {
          folder = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: []
          };

          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }

        currentLevel = folder.children;
      } else {
        currentLevel.push({
          name: part,
          path: currentPath,
          type: 'file'
        });
      }
    });
  });

  return root;
}


// Detect programming language using file extension
function getLanguage(filePath = '') {
  const extension = filePath.split('.').pop().toLowerCase();

  const languages = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    xml: 'xml',
    sql: 'sql',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash'
  };

  return languages[extension] || 'text';
}


export default function RepositoryExplorer() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  // Repository information
  const [repoDetails, setRepoDetails] = useState(null);

  // Repository file tree
  const [treeItems, setTreeItems] = useState([]);

  // Multiple opened files
  const [openFiles, setOpenFiles] = useState([]);

  // Active file
  const [selectedFile, setSelectedFile] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing UI states
  const [expanded, setExpanded] = useState(
    () => new Set(['backend', 'frontend'])
  );

  const [treeSearch, setTreeSearch] = useState('');
  const [explanationOpen, setExplanationOpen] = useState(true);


  // API 1: Repository details
  // API 2: Repository tree
  useEffect(() => {
    const controller = new AbortController();

    async function fetchRepository() {
      try {
        setLoading(true);
        setError(null);

        // Fetch repository details
        const detailsResponse = await fetch(
          `${API_BASE_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
          { signal: controller.signal }
        );

        const detailsResult = await detailsResponse.json();

        if (!detailsResponse.ok || !detailsResult.success) {
          throw new Error(
            detailsResult.message || 'Failed to fetch repository details'
          );
        }

        setRepoDetails(detailsResult.data);


        // Fetch repository file tree
        const treeResponse = await fetch(
          `${API_BASE_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree`,
          { signal: controller.signal }
        );

        const treeResult = await treeResponse.json();

        if (!treeResponse.ok || !treeResult.success) {
          throw new Error(
            treeResult.message || 'Failed to fetch repository tree'
          );
        }

        // Convert flat paths into nested folders
        setTreeItems(buildFileTree(treeResult.data.files));

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Repository loading error:', err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (owner && repo) {
      fetchRepository();
    }

    return () => controller.abort();

  }, [owner, repo]);



  const workspaceRef = useRef(null);
  const [chatWidth, setChatWidth] = useState(360);
  const [isResizing, setIsResizing] = useState(false);

      const handleChatResize = (event) => {
        if (!isResizing || !workspaceRef.current) return;
      
        const workspaceRight =
          workspaceRef.current.getBoundingClientRect().right;
      
        const newWidth = workspaceRight - event.clientX;
      
        setChatWidth(Math.min(600, Math.max(260, newWidth)));
      };

      const stopChatResize = (event) => {
        setIsResizing(false);
      
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      };

        // API 3: Fetch actual file content
  async function handleFileSelect(path) {
    console.log(`Fetching content for file: ${path}`);
    // Check whether file is already open
    const existingFile = openFiles.find(
      (file) => file.path === path
    );

    // If already open, activate its tab
    if (existingFile) {
      setSelectedFile(path);
      return;
    }

    // Open new tab immediately with loading state
    setSelectedFile(path);

    setOpenFiles((current) => [
      ...current,
      {
        path,
        content: '',
        loading: true,
        error: null
      }
    ]);

    try {
      const query = new URLSearchParams({ path });

      const response = await fetch(
        `${API_BASE_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/files?${query}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to fetch file content'
        );
      }

      // Update only the matching tab
      setOpenFiles((current) =>
        current.map((file) =>
          file.path === path
            ? {
                ...file,
                content: result.data.content,
                loading: false,
                error: null
              }
            : file
        )
      );

    } catch (err) {
      console.error('File content error:', err);

      setOpenFiles((current) =>
        current.map((file) =>
          file.path === path
            ? {
                ...file,
                loading: false,
                error: err.message
              }
            : file
        )
      );
    }
  }


  // Close an editor tab
  function closeFile(path) {
    const remainingFiles = openFiles.filter(
      (file) => file.path !== path
    );

    setOpenFiles(remainingFiles);

    // If active tab is closed, select another open tab
    if (selectedFile === path) {
      setSelectedFile(
        remainingFiles.length > 0
          ? remainingFiles[remainingFiles.length - 1].path
          : null
      );
    }
  }


  // Get currently active file
  const activeFile = openFiles.find(
    (file) => file.path === selectedFile
  );

  // Convert actual source content into lines
  const lines = activeFile?.content !== undefined &&
    activeFile?.content !== ''
    ? activeFile.content.split('\n')
    : activeFile?.content === ''
      ? []
      : [];

  const fileName =
    selectedFile?.split('/').pop() || 'Select a file';

  const language = getLanguage(selectedFile || '');

  const fileLoading = activeFile?.loading || false;
  const fileError = activeFile?.error || null;


  // File explanation information
  const details = {
    type: selectedFile
      ? `${language.toUpperCase()} SOURCE FILE`
      : 'REPOSITORY EXPLORER',

    summary: selectedFile
      ? `Viewing the actual source code of ${fileName} from the connected GitHub repository.`
      : 'Select a file from the explorer to view its source code.'
  };


  // Expand or collapse folders
  function toggleFolder(path) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }


  // Render repository folders and files
  function renderTree(items) {
    return items
      .filter((item) =>
        item.name.toLowerCase().includes(treeSearch.toLowerCase()) ||
        item.type === 'folder'
      )
      .map((item) => {
        const open = expanded.has(item.path);

        if (item.type === 'folder') {
          return (
            <div key={item.path}>
              <button
                className="tree-item folder-item"
                onClick={() => toggleFolder(item.path)}
              >
                {open
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />}

                {open
                  ? <FolderOpen size={15} />
                  : <Folder size={15} />}

                <span>{item.name}</span>
              </button>

              {open && (
                <div className="tree-children">
                  {renderTree(item.children)}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={item.path}
            className={`tree-item file-item ${
              selectedFile === item.path ? 'selected' : ''
            }`}
            onClick={() => handleFileSelect(item.path)}
          >
            <FileCode2 size={14} />
            <span>{item.name}</span>
          </button>
        );
      });
  }


  // Repository loading screen
  if (loading) {
    return (
      <div className="explorer-page">
        Loading repository...
      </div>
    );
  }


  // Repository error screen
  if (error) {
    return (
      <div className="explorer-page">
        <p>Failed to load repository: {error}</p>

        <button onClick={() => navigate('/connect')}>
          Back to repositories
        </button>
      </div>
    );
  }


  const repositoryName = repoDetails?.name || repo;
  const branch = repoDetails?.defaultBranch || 'main';


  return (
    <div className="explorer-page">

      {/* Repository heading */}
      <div className="explorer-heading">
        <div>
          <div className="explorer-breadcrumb">
            <span>Repositories</span>
            <ChevronRight size={13} />
            <strong>{repositoryName}</strong>
          </div>

          <h1>
            {owner} <span>/</span> {repositoryName}
          </h1>
        </div>

        <div className="explorer-meta">
          <span>
            <GitBranch size={14} />
            {branch}
          </span>

          <span className="demo-label">
            <Circle size={7} fill="currentColor" />
            LIVE REPOSITORY
          </span>
        </div>
      </div>


    <div className="explorer-workspace" ref={workspaceRef}>
        {/* LEFT: File explorer */}
        <aside className="explorer-files">

          <div className="explorer-pane-heading">
            <span>EXPLORER</span>

            <button aria-label="Explorer options">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="repo-root-row">
            <ChevronDown size={14} />
            <FolderOpen size={15} />
            <strong>{repositoryName}</strong>
          </div>

          <label className="tree-search">
            <Search size={13} />

            <input
              placeholder="Find a file..."
              value={treeSearch}
              onChange={(event) => setTreeSearch(event.target.value)}
              aria-label="Find a file"
            />
          </label>

          <div className="file-tree">
            {renderTree(treeItems)}
          </div>

          <div className="tree-footer">
            <span>
              <GitBranch size={12} />
              {branch}
            </span>

            <span>
              <Activity size={12} />
              {repoDetails?.language || 'Source'}
            </span>
          </div>

        </aside>


        {/* CENTER: Code editor */}
        <section className="explorer-code">

          {/* Multiple open file tabs */}
          <div className="file-tabs">

            {openFiles.map((file, index) => {
  const name = file.path.split('/').pop();

  return (
    <div
      key={file.path}
      className={`file-tab ${
        selectedFile === file.path ? 'active' : ''
      }`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          'text/plain',
          String(index)
        );
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        event.preventDefault();

        const draggedIndex = Number(
          event.dataTransfer.getData('text/plain')
        );

        if (draggedIndex === index) return;

        setOpenFiles((current) => {
          const updated = [...current];

          const [draggedFile] = updated.splice(
            draggedIndex,
            1
          );

          updated.splice(index, 0, draggedFile);

          return updated;
        });
      }}
    >
      <div
        className="file-tab-content"
        onClick={() => setSelectedFile(file.path)}
      >
        <FileCode2 size={14} />
        <span>{name}</span>
      </div>

      <button
        aria-label={`Close ${name}`}
        onClick={() => closeFile(file.path)}
      >
        ×
      </button>
    </div>
  );
})}

            <button
              className="tab-more"
              aria-label="More file options"
            >
              <MoreHorizontal size={16} />
            </button>

          </div>


          {/* File path breadcrumb */}
          <div className="code-breadcrumb">
            <span>{repositoryName}</span>

            {selectedFile &&
              selectedFile.split('/').map((part, index, list) => (
                <span
                  className="crumb-piece"
                  key={`${part}-${index}`}
                >
                  {part}

                  {index < list.length - 1 && (
                    <ChevronRight size={12} />
                  )}
                </span>
              ))
            }
          </div>


          {/* Actual code viewer */}
          {fileLoading ? (
            <div className="code-viewer">
              Loading file content...
            </div>
          ) : fileError ? (
            <div className="code-viewer">
              Failed to load file: {fileError}
            </div>
          ) : selectedFile ? (
            <CodeViewer
              lines={lines}
              language={language}
            />
          ) : (
            <div className="code-viewer">
              Select a file from the left explorer to view its code.mm
            </div>
          )}


          {/* Editor status bar */}
          <div className="code-statusbar">
            <span>
              <GitBranch size={12} />
              {branch}
            </span>

            <span>UTF-8</span>

            <span>{language}</span>

            <span>
              Ln {lines.length}, Col 1
            </span>
          </div>

        </section>

        {explanationOpen && (
                <div
                  className={`chat-resize-handle ${isResizing ? 'resizing' : ''}`}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setIsResizing(true);
                  }}
                  onPointerMove={handleChatResize}
                  onPointerUp={stopChatResize}
                  onPointerCancel={stopChatResize}
                />  
        )}


        {/* RIGHT: AI Code Chat */}
        {explanationOpen ? (
          <RepositoryChat
                owner={owner}
                repo={repo}
                repositoryName={repositoryName}
                selectedFile={selectedFile}
                selectedFileContent={activeFile?.content || ''}
                width={chatWidth}
                onClose={() => setExplanationOpen(false)}
        />
        ) : (
          <button
            className="reopen-explainer"
            onClick={() => setExplanationOpen(true)}
          >
            <Sparkles size={15} />
            Show AI Chat
          </button>
        )}

      </div>
    </div>
  );
}

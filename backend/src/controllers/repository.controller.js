import { analyzeCode } from '../utils/codeAnalyzer.js';
import { analyzeDependencies } from '../utils/dependencyAnalyzer.js';
import path from 'node:path';
export const connectRepository = (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL is required'
      });
    }

    const url = new URL(repoUrl);

    if (url.hostname !== 'github.com' || url.protocol !== 'https:') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid GitHub repository URL'
      });
    }

    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid repository URL format'
      });
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');

    return res.status(200).json({
      success: true,
      message: 'Repository URL received successfully',
      data: {
        repoUrl,
        owner,
        repo
      }
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid URL'
    });
  }
};





// Get repository details from GitHub repository
export const getRepositoryDetails = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const githubResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    );

    if (githubResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (!githubResponse.ok) {
      return res.status(githubResponse.status).json({
        success: false,
        message: 'Failed to fetch repository details from GitHub'
      });
    }

    const githubData = await githubResponse.json();

    return res.status(200).json({
      success: true,
      message: 'Repository details fetched successfully',
      data: {
        name: githubData.name,
        fullName: githubData.full_name,
        description: githubData.description,
        language: githubData.language,
        stars: githubData.stargazers_count,
        defaultBranch: githubData.default_branch,
        htmlUrl: githubData.html_url
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



// Get repository tree from GitHub repository
export const getRepositoryTree = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Step 1: Get repository details to find default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    );

    if (!repoResponse.ok) {
      return res.status(repoResponse.status).json({
        success: false,
        message: 'Repository not found or GitHub request failed'
      });
    }

    const repoData = await repoResponse.json();
    const branch = repoData.default_branch;

    // Step 2: Fetch complete repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    );

    if (!treeResponse.ok) {
      return res.status(treeResponse.status).json({
        success: false,
        message: 'Failed to fetch repository tree'
      });
    }

    const treeData = await treeResponse.json();

    // Step 3: Convert GitHub types into simple file/folder types
    const files = treeData.tree.map((item) => ({
      path: item.path,
      type: item.type === 'tree' ? 'folder' : 'file'
    }));

    const totalFiles = files.filter(
      (item) => item.type === 'file'
    ).length;

    const totalFolders = files.filter(
      (item) => item.type === 'folder'
    ).length;

    return res.status(200).json({
      success: true,
      message: 'Repository tree fetched successfully',
      data: {
        repository: repoData.full_name,
        branch,
        totalFiles,
        totalFolders,
        files
      }
    });

  } catch (error) {
    console.error('Repository Tree Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};




// Get file contnent from GitHub repository
export const getFileContent = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path } = req.query;

    // Validate file path
    if (!path) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Fetch file content from GitHub
    const githubResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`,
      {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    );

    if (githubResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!githubResponse.ok) {
      return res.status(githubResponse.status).json({
        success: false,
        message: 'Failed to fetch file from GitHub'
      });
    }

    const fileData = await githubResponse.json();

    // Check whether the requested path is a file
    if (Array.isArray(fileData) || fileData.type !== 'file') {
      return res.status(400).json({
        success: false,
        message: 'The requested path is not a file'
      });
    }

    // GitHub returns Base64 encoded content
    if (!fileData.content || fileData.encoding !== 'base64') {
      return res.status(415).json({
        success: false,
        message: 'File content is not available in supported format'
      });
    }

    const content = Buffer
      .from(fileData.content.replace(/\s/g, ''), 'base64')
      .toString('utf-8');

    return res.status(200).json({
      success: true,
      message: 'File content fetched successfully',
      data: {
        fileName: fileData.name,
        path: fileData.path,
        size: fileData.size,
        content
      }
    });

  } catch (error) {
    console.error('Get File Content Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};




export const analyzeRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Step 1: Get repository details and default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
           Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!repoResponse.ok) {

      // Read the actual error returned by GitHub.
      const errorBody = await repoResponse.text();

      // Print status code and GitHub error in terminal.
      console.log('GitHub Status:', repoResponse.status);
      console.log('GitHub Error:', errorBody);

      // Check GitHub API rate limit.
      console.log(
        'Remaining Requests:',
        repoResponse.headers.get('x-ratelimit-remaining')
      );

      return res.status(repoResponse.status).json({
        success: false,
        message: 'Failed to fetch repository details',
        error: errorBody
      });
    }

    const repoData = await repoResponse.json();
    const branch = repoData.default_branch;

    // Step 2: Fetch repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!treeResponse.ok) {
      // Read the actual error returned by GitHub.
      const errorBody = await treeResponse.text();

      // Print status code and GitHub error in terminal.
      console.log('GitHub Status:', treeResponse.status);
      console.log('GitHub Error:', errorBody);

      // Check GitHub API rate limit.
      console.log(
        'Remaining Requests:',
        treeResponse.headers.get('x-ratelimit-remaining')
      );

      return res.status(treeResponse.status).json({
        success: false,
        message: 'Failed to fetch repository tree',
        error: errorBody
      });
    }

    const treeData = await treeResponse.json();

    // Step 3: Select supported source files
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

    const excludedFolders = [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/'
    ];

    const selectedFiles = treeData.tree
      .filter((item) => {
        return (
          item.type === 'blob' &&
          supportedExtensions.some((ext) => item.path.endsWith(ext)) &&
          !excludedFolders.some((folder) => item.path.startsWith(folder)) &&
          item.size <= 1024 * 1024
        );
      })
      .slice(0, 20);

    // Step 4: Fetch and analyze each selected file
    const fileResults = [];

    for (const file of selectedFiles) {
        console.log("file"+file.path)
      const fileResponse = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file.path
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
          }
        }
      );

        // Check whether GitHub successfully returned the file.
      if (!fileResponse.ok) {
      
        // Print GitHub's HTTP status code (example: 403, 404).
        console.log('GitHub Status:', fileResponse.status);
      
        // Print the actual error message returned by GitHub.
        console.log('GitHub Error:', await fileResponse.text());
      
        // Skip this file and continue with the next file.
        continue;
      }
      if (!fileResponse.ok) {
        continue;
      }

      const fileData = await fileResponse.json();

      if (
        fileData.type !== 'file' ||
        fileData.encoding !== 'base64' ||
        !fileData.content
      ) {
        continue;
      }

      const content = Buffer
        .from(fileData.content.replace(/\s/g, ''), 'base64')
        .toString('utf-8');

      const analysis = analyzeCode(content, file.path);

      fileResults.push(analysis);
    }

    // Step 5: Calculate repository-level totals
    const summary = fileResults.reduce(
      (total, file) => {
        total.functionsFound += file.functionsFound;
        total.importsFound += file.importsFound;
        total.exportsFound += file.exportsFound;
        total.potentialIssues += file.potentialIssues.length;

        return total;
      },
      {
        functionsFound: 0,
        importsFound: 0,
        exportsFound: 0,
        potentialIssues: 0
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Repository analysis completed',
      data: {
        repository: repoData.full_name,
        branch,
        analyzedFiles: fileResults.length,
        selectedFiles: selectedFiles.length,
        summary,
        files: fileResults
      }
    });

  } catch (error) {
    console.error('Repository Analysis Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};








const resolveLocalDependency = (
  sourceFile,
  specifier,
  availableFiles
) => {
  // Convert relative import into repository-relative path
  const basePath = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourceFile), specifier)
  );

  const candidates = [basePath];

  // Check common extensions if import has no extension
  if (!path.posix.extname(basePath)) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];

    for (const extension of extensions) {
      candidates.push(`${basePath}${extension}`);
    }

    for (const extension of extensions) {
      candidates.push(`${basePath}/index${extension}`);
    }
  }

  return (
    candidates.find((candidate) => availableFiles.has(candidate)) || null
  );
};


// Repository Dependency Analysis API
export const getRepositoryDependencies = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Step 1: Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!repoResponse.ok) {
      return res.status(repoResponse.status).json({
        success: false,
        message: 'Failed to fetch repository details',
        error: await repoResponse.text()
      });
    }

    const repoData = await repoResponse.json();
    const branch = repoData.default_branch;

    // Step 2: Fetch repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!treeResponse.ok) {
      return res.status(treeResponse.status).json({
        success: false,
        message: 'Failed to fetch repository tree',
        error: await treeResponse.text()
      });
    }

    const treeData = await treeResponse.json();

    // Step 3: Select supported source files
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

    const excludedFolders = [
      'node_modules',
      'dist',
      'build',
      '.next',
      'coverage'
    ];

    const selectedFiles = treeData.tree
      .filter((item) => {
        const hasSupportedExtension = supportedExtensions.some(
          (extension) => item.path.endsWith(extension)
        );

        const isExcluded = item.path
          .split('/')
          .some((folder) => excludedFolders.includes(folder));

        return (
          item.type === 'blob' &&
          hasSupportedExtension &&
          !isExcluded &&
          item.size <= 1024 * 1024
        );
      })
      .slice(0, 20);

    // Step 4: Fetch file content and extract dependencies
    const fileResults = [];

    for (const file of selectedFiles) {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file.path
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
          }
        }
      );

      if (!fileResponse.ok) {
        console.log(
          `Failed to fetch ${file.path}:`,
          fileResponse.status
        );
        continue;
      }

      const fileData = await fileResponse.json();

      if (
        fileData.type !== 'file' ||
        fileData.encoding !== 'base64' ||
        !fileData.content
      ) {
        continue;
      }

      const content = Buffer
        .from(fileData.content.replace(/\s/g, ''), 'base64')
        .toString('utf-8');

      const analysis = analyzeDependencies(content, file.path);

      fileResults.push(analysis);
    }

    // Step 5: Store available repository file paths
    const availableFiles = new Set(
      fileResults.map((file) => file.filePath)
    );

    // Step 6: Resolve local dependencies
    const dependencies = fileResults.map((file) => {
      const resolvedDependencies = file.dependencies.map((dependency) => {
        if (dependency.type === 'external') {
          return {
            ...dependency,
            resolvedPath: null
          };
        }

        const resolvedPath = resolveLocalDependency(
          file.filePath,
          dependency.specifier,
          availableFiles
        );

        return {
          ...dependency,
          resolvedPath
        };
      });

      return {
        filePath: file.filePath,
        dependenciesFound: resolvedDependencies.length,
        dependencies: resolvedDependencies
      };
    });

    // Step 7: Calculate summary
    const allDependencies = dependencies.flatMap(
      (file) => file.dependencies
    );

    const summary = {
      analyzedFiles: dependencies.length,
      totalDependencies: allDependencies.length,

      localDependencies: allDependencies.filter(
        (item) => item.type === 'local'
      ).length,

      externalDependencies: allDependencies.filter(
        (item) => item.type === 'external'
      ).length,

      unresolvedLocalDependencies: allDependencies.filter(
        (item) => item.type === 'local' && !item.resolvedPath
      ).length
    };

    // Step 8: Send response
    return res.status(200).json({
      success: true,
      message: 'Dependency analysis completed',
      data: {
        repository: repoData.full_name,
        branch,
        summary,
        dependencies
      }
    });

  } catch (error) {
    console.error('Dependency Analysis Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


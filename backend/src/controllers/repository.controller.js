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


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

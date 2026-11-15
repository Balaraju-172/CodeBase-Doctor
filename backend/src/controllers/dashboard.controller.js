export const getDashboardStats = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard stats fetched successfully',
    data: {
      totalRepositories: 5,
      filesAnalyzed: 240,
      potentialBugs: 12,
      completedAnalyses: 8
    }
  });
};




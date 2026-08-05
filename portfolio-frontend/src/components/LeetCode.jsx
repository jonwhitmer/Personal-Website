import React, { useState, useEffect } from 'react';

async function getLeetCodeData(username) {
  const response = await fetch(`/api/leetcode/${username}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

export default function LeetCodeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getLeetCodeData('jonwhtimer');
        
        if (!result) {
          setError('User not found');
          return;
        }
        
        setData(result);
      } catch (err) {
        setError(`Failed to fetch LeetCode data: ${err.message}`);
        console.error('LeetCode API Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading LeetCode stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const statsMap = {};
  data.stats.forEach(item => {
    statsMap[item.difficulty] = item.count;
  });

  const totalSolved = data.stats.reduce((sum, item) => sum + item.count, 0);

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">LeetCode Stats</h1>
        
        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Problems Solved</h2>
          
          <div className="text-4xl font-bold text-blue-600 mb-6">
            {totalSolved}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {['Easy', 'Medium', 'Hard'].map(difficulty => (
              <div key={difficulty} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${difficultyColors[difficulty]}`}>
                  {difficulty}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {statsMap[difficulty] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Submissions</h2>
          
          <div className="space-y-3">
            {data.recent.map((submission, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a 
                      href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      {submission.title}
                    </a>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {submission.lang}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        submission.statusDisplay === 'Accepted' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {submission.statusDisplay}
                      </span>
                      <span className="text-gray-500">
                        {new Date(parseInt(submission.timestamp) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
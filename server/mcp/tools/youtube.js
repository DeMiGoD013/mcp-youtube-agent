const { searchVideos } = require('../../services/youtubeClient');

/**
 * MCP tool: youtube_search
 * args: { query: string, maxResults?: number }
 */
async function youtubeSearch(args) {
  const query = args.query;
  const maxResults = args.maxResults || 5;

  if (!query || typeof query !== 'string') {
    throw new Error('youtube_search requires a "query" string');
  }

  const videos = await searchVideos(query, maxResults);
  return videos;
}

module.exports = {
  youtubeSearch
};

/**
 * Service for Roblox Game and Universe queries.
 */

/**
 * Fetches detailed metadata for a Roblox universe.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} universeId Universe ID
 * @returns {Promise<{
 *   id: number,
 *   name: string,
 *   description: string,
 *   creatorId: number,
 *   creatorName: string,
 *   creatorType: string,
 *   price: number,
 *   visits: number,
 *   playing: number,
 *   maxPlayers: number,
 *   created: string,
 *   updated: string
 * } | null>}
 */
async function fetchUniverseInfo(http, universeId) {
  const data = await http.request('games', `/v1/games?universeIds=${universeId}`, { authenticated: false });
  if (data && data.data && data.data.length > 0) {
    const game = data.data[0];
    return {
      id: game.id,
      name: game.name,
      description: game.description || '',
      creatorId: game.creator.id,
      creatorName: game.creator.name,
      creatorType: game.creator.type,
      price: game.price || 0,
      visits: game.visits || 0,
      playing: game.playing || 0,
      maxPlayers: game.maxPlayers || 0,
      created: game.created,
      updated: game.updated,
    };
  }
  return null;
}

/**
 * Fetches public game servers running for a place ID.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} placeId Place ID
 * @param {object} [options] Query options
 * @param {number} [options.limit] Number of servers to return (allowed values: 10, 25, 50, 100 - default: 10)
 * @param {string} [options.cursor] Pagination cursor
 * @param {string} [options.sortOrder] Sort order: 'Asc' or 'Desc' (default: 'Asc')
 * @returns {Promise<{
 *   servers: {
 *     id: string,
 *     maxPlayers: number,
 *     playing: number,
 *     fps: number,
 *     ping: number
 *   }[],
 *   nextPageCursor: string|null
 * } | null>}
 */
async function fetchGameServers(http, placeId, options = {}) {
  // Roblox public servers API strictly enforces limit values of 10, 25, 50, or 100.
  // Any other values return a 400 Bad Request error.
  let limit = options.limit || 10;
  if (![10, 25, 50, 100].includes(limit)) {
    // Snap to the closest valid limit or default to 10
    if (limit <= 17) limit = 10;
    else if (limit <= 37) limit = 25;
    else if (limit <= 75) limit = 50;
    else limit = 100;
  }

  const cursor = options.cursor || '';
  const sortOrder = options.sortOrder || 'Asc';

  const path = `/v1/games/${placeId}/servers/Public?limit=${limit}` + 
               (cursor ? `&cursor=${cursor}` : '') + 
               `&sortOrder=${sortOrder}`;

  const data = await http.request('games', path, { authenticated: false });
  if (!data || !data.data) return null;

  const servers = data.data.map((srv) => ({
    id: srv.id,
    maxPlayers: srv.maxPlayers || 0,
    playing: srv.playing || 0,
    fps: Math.round(srv.fps || 0),
    ping: srv.ping || 0,
  }));

  return {
    servers,
    nextPageCursor: data.nextPageCursor || null,
  };
}

module.exports = {
  fetchUniverseInfo,
  fetchGameServers,
};

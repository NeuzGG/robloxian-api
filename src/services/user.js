/**
 * Service for Roblox User lookups, details, presence checks, and cookie validation.
 */

/**
 * Resolves a Roblox username to user details.
 * @param {HTTPClient} http HTTP client instance
 * @param {string} username Roblox Username
 * @returns {Promise<{ id: number, username: string, displayName: string } | null>}
 */
async function fetchRobloxUser(http, username) {
  const data = await http.request('users', '/v1/usernames/users', {
    method: 'POST',
    body: {
      usernames: [username],
      excludeBannedUsers: false,
    },
    authenticated: false, // Username lookup doesn't need authentication
  });

  if (data && data.data && data.data.length > 0) {
    const user = data.data[0];
    return {
      id: user.id,
      username: user.name,
      displayName: user.displayName,
    };
  }

  return null;
}

/**
 * Fetches the avatar headshot URL for a Roblox user.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @returns {Promise<string|null>}
 */
async function fetchRobloxUserAvatar(http, userId) {
  const data = await http.request(
    'thumbnails',
    `/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
    { authenticated: false }
  );

  if (data && data.data && data.data.length > 0) {
    return data.data[0].imageUrl || null;
  }

  return null;
}

/**
 * Fetches detailed public profile information of a Roblox user.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @returns {Promise<{
 *   id: number,
 *   username: string,
 *   displayName: string,
 *   description: string,
 *   created: string,
 *   isBanned: boolean,
 *   hasVerifiedBadge: boolean
 * } | null>}
 */
async function fetchUserDetails(http, userId) {
  const data = await http.request('users', `/v1/users/${userId}`, { authenticated: false });
  if (!data) return null;

  return {
    id: data.id,
    username: data.name,
    displayName: data.displayName,
    description: data.description || '',
    created: data.created,
    isBanned: data.isBanned || false,
    hasVerifiedBadge: data.hasVerifiedBadge || false,
  };
}

/**
 * Fetches presence (online, offline, in-game, in-studio) for a list of User IDs.
 * Presence Types: 0 = Offline, 1 = Online, 2 = In Game, 3 = In Studio
 * @param {HTTPClient} http HTTP client instance
 * @param {number[]} userIds Array of Roblox User IDs (max 100)
 * @returns {Promise<{
 *   userId: number,
 *   status: number,
 *   statusText: string,
 *   lastOnline: string,
 *   placeId: number|null,
 *   gameId: string|null
 * }[] | null>}
 */
async function fetchUserPresence(http, userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];

  const data = await http.request('presence', '/v1/presence/users', {
    method: 'POST',
    body: { userIds },
    authenticated: false,
  });

  if (!data || !data.userPresences) return null;

  const presenceMap = {
    0: 'Offline',
    1: 'Online',
    2: 'In Game',
    3: 'In Studio',
  };

  return data.userPresences.map((p) => ({
    userId: p.userId,
    status: p.userPresenceType,
    statusText: presenceMap[p.userPresenceType] || 'Offline',
    lastOnline: p.lastOnline,
    placeId: p.placeId || null,
    gameId: p.gameId || null,
  }));
}

/**
 * Validates the cookie currently loaded in the HTTP Client.
 * Retrieves authenticated user identity and Robux balance.
 * @param {HTTPClient} http HTTP client instance
 * @returns {Promise<{
 *   valid: boolean,
 *   id?: number,
 *   username?: string,
 *   displayName?: string,
 *   robux?: number
 * }>}
 */
async function validateCookie(http) {
  if (!http.cookie) {
    return { valid: false };
  }

  // Get user identification
  const authData = await http.request('users', '/v1/users/authenticated', { authenticated: true });
  if (!authData || !authData.id) {
    return { valid: false };
  }

  // Get Robux balance from economy API
  const econData = await http.request('economy', `/v1/users/${authData.id}/currency`, { authenticated: true });
  const robux = econData ? (econData.robux ?? econData.Robux ?? 0) : 0;

  return {
    valid: true,
    id: authData.id,
    username: authData.name,
    displayName: authData.displayName,
    robux: Number(robux),
  };
}

module.exports = {
  fetchRobloxUser,
  fetchRobloxUserAvatar,
  fetchUserDetails,
  fetchUserPresence,
  validateCookie,
};

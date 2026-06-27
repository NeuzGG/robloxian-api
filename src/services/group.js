/**
 * Service for Roblox Group operations: membership, roles, and member listings.
 */

/**
 * Check if a specific userId is in a group.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @param {string|number} groupId Roblox Group ID
 * @returns {Promise<boolean>}
 */
async function checkGroupMembership(http, userId, groupId) {
  const data = await http.request('groups', `/v1/users/${userId}/groups/roles`, { authenticated: false });
  if (!data || !data.data || !Array.isArray(data.data)) return false;

  return data.data.some((g) => String(g.group.id) === String(groupId));
}

/**
 * Fetches the user's role and rank in a specific group.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @param {string|number} groupId Roblox Group ID
 * @returns {Promise<{ id: number, name: string, rank: number } | null>} Returns null if the user is not in the group.
 */
async function fetchUserGroupRole(http, userId, groupId) {
  const data = await http.request('groups', `/v1/users/${userId}/groups/roles`, { authenticated: false });
  if (!data || !data.data || !Array.isArray(data.data)) return null;

  const found = data.data.find((g) => String(g.group.id) === String(groupId));
  if (!found || !found.role) return null;

  return {
    id: found.role.id,
    name: found.role.name,
    rank: found.role.rank,
  };
}

/**
 * Fetches all roles within a group.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} groupId Roblox Group ID
 * @returns {Promise<{ id: number, name: string, rank: number, memberCount: number }[] | null>}
 */
async function fetchGroupRoles(http, groupId) {
  const data = await http.request('groups', `/v1/groups/${groupId}/roles`, { authenticated: false });
  if (!data || !data.roles || !Array.isArray(data.roles)) return null;

  return data.roles.map((r) => ({
    id: r.id,
    name: r.name,
    rank: r.rank,
    memberCount: r.memberCount || 0,
  }));
}

/**
 * Fetches members of a group.
 * Supports recursive/pagination.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} groupId Roblox Group ID
 * @param {object} [options] Options for listing
 * @param {boolean} [options.recursive] Recursively page through all members (default: true)
 * @param {string} [options.cursor] Starting cursor for manual pagination
 * @param {number} [options.limit] Limit per request (max 100, default: 100)
 * @returns {Promise<{
 *   members: { id: number, username: string, displayName: string }[],
 *   nextPageCursor: string|null
 * }>}
 */
async function fetchGroupMembers(http, groupId, options = {}) {
  const recursive = options.recursive !== false;
  const limit = Math.min(options.limit || 100, 100);
  const members = [];
  let cursor = options.cursor || '';

  try {
    do {
      const path = `/v1/groups/${groupId}/users?limit=${limit}` + (cursor ? `&cursor=${cursor}` : '');
      const data = await http.request('groups', path, { authenticated: false });

      if (!data || !data.data) {
        break;
      }

      for (const item of data.data) {
        members.push({
          id: item.user.userId,
          username: item.user.username,
          displayName: item.user.displayName,
        });
      }

      cursor = data.nextPageCursor || null;
    } while (recursive && cursor);

    return {
      members,
      nextPageCursor: recursive ? null : cursor,
    };
  } catch (err) {
    http.logger.error(`Error fetching group members: ${err.message}`);
    return {
      members,
      nextPageCursor: null,
    };
  }
}

module.exports = {
  checkGroupMembership,
  fetchUserGroupRole,
  fetchGroupRoles,
  fetchGroupMembers,
};

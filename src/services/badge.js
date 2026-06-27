/**
 * Service for Roblox Badge information and ownership verification.
 */

/**
 * Fetches information about a Roblox badge.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} badgeId Badge ID
 * @returns {Promise<{
 *   id: number,
 *   name: string,
 *   description: string,
 *   displayName: string,
 *   iconImageId: number,
 *   isEnabled: boolean,
 *   awardCount: number,
 *   winRate: number
 * } | null>}
 */
async function fetchBadgeInfo(http, badgeId) {
  const data = await http.request('badges', `/v1/badges/${badgeId}`, { authenticated: false });
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    displayName: data.displayName || '',
    iconImageId: data.iconImageId || 0,
    isEnabled: data.enabled || false,
    awardCount: data.statistics?.awardedCount || 0,
    winRate: data.statistics?.winRatePercentage || 0,
  };
}

/**
 * Checks if a specific user owns a badge or multiple badges.
 * Requires authenticated client (ROBLOX_COOKIE) or fallback to public endpoints.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @param {string|number|Array<string|number>} badgeIds A single Badge ID or an array of Badge IDs
 * @returns {Promise<boolean | Record<string, boolean>>} If single badge ID is supplied, returns a boolean. If array, returns a key-value mapping of badgeId -> boolean.
 */
async function checkUserOwnsBadge(http, userId, badgeIds) {
  const isArray = Array.isArray(badgeIds);
  const ids = isArray ? badgeIds : [badgeIds];

  if (ids.length === 0) {
    return isArray ? {} : false;
  }

  // Roblox badge awards endpoint accepts query parameter `badgeIds` as comma separated values
  const badgeIdString = ids.join(',');
  const path = `/v1/users/${userId}/badges/awarded-dates?badgeIds=${badgeIdString}`;
  
  const result = await http.request('badges', path, { authenticated: true });
  
  const ownedMap = {};
  ids.forEach(id => {
    ownedMap[String(id)] = false;
  });

  if (result && result.data && Array.isArray(result.data)) {
    result.data.forEach(item => {
      const bId = String(item.badgeId);
      if (bId in ownedMap) {
        ownedMap[bId] = true;
      }
    });
  }

  return isArray ? ownedMap : ownedMap[String(badgeIds)] || false;
}

module.exports = {
  fetchBadgeInfo,
  checkUserOwnsBadge,
};

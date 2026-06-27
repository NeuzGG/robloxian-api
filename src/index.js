const RobloxClient = require('./client');

// Instantiate a default client instance that automatically uses process.env.ROBLOX_COOKIE
const defaultClient = new RobloxClient();

module.exports = {
  // Export Client Class
  RobloxClient,

  // Sourced from defaultClient (backward compatible & easy-use functional API)
  
  // Gamepass Service
  extractGamepassIds: (text) => defaultClient.extractGamepassIds(text),
  fetchGamepassInfo: (id) => defaultClient.fetchGamepassInfo(id),
  fetchGamepassDetails: (id) => defaultClient.fetchGamepassDetails(id),
  checkUserOwnsGamepass: (userId, gamepassId) => defaultClient.checkUserOwnsGamepass(userId, gamepassId),

  // User Service
  fetchRobloxUser: (username) => defaultClient.fetchRobloxUser(username),
  fetchRobloxUserAvatar: (userId) => defaultClient.fetchRobloxUserAvatar(userId),
  fetchUserDetails: (userId) => defaultClient.fetchUserDetails(userId),
  fetchUserPresence: (userIds) => defaultClient.fetchUserPresence(userIds),
  validateCookie: () => defaultClient.validateCookie(),

  // Group Service
  checkGroupMembership: (userId, groupId) => defaultClient.checkGroupMembership(userId, groupId),
  fetchUserGroupRole: (userId, groupId) => defaultClient.fetchUserGroupRole(userId, groupId),
  fetchGroupRoles: (groupId) => defaultClient.fetchGroupRoles(groupId),
  fetchGroupMembers: (groupId, options) => defaultClient.fetchGroupMembers(groupId, options),

  // Badge Service
  fetchBadgeInfo: (badgeId) => defaultClient.fetchBadgeInfo(badgeId),
  checkUserOwnsBadge: (userId, badgeIds) => defaultClient.checkUserOwnsBadge(userId, badgeIds),

  // Catalog/Economy Service
  fetchCatalogItemsDetails: (items) => defaultClient.fetchCatalogItemsDetails(items),
  fetchAssetDetails: (assetId) => defaultClient.fetchAssetDetails(assetId),
  checkUserOwnsAsset: (userId, assetId) => defaultClient.checkUserOwnsAsset(userId, assetId),

  // Game Service
  fetchUniverseInfo: (universeId) => defaultClient.fetchUniverseInfo(universeId),
  fetchGameServers: (placeId, options) => defaultClient.fetchGameServers(placeId, options),
};

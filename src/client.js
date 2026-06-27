const Logger = require('./utils/logger');
const HTTPClient = require('./utils/http');

const gamepass = require('./services/gamepass');
const user = require('./services/user');
const group = require('./services/group');
const badge = require('./services/badge');
const catalog = require('./services/catalog');
const game = require('./services/game');

class RobloxClient {
  /**
   * Create a new RobloxClient instance.
   * Allows multiple bots/accounts with different configurations in the same process.
   * @param {object} [options] Client options
   * @param {string} [options.cookie] Roblox .ROBLOSECURITY cookie
   * @param {string} [options.logLevel] Level: debug, info, warn, error, none (default: info)
   * @param {boolean} [options.useProxy] Whether to try RoProxy first (default: true)
   * @param {number} [options.timeout] Request timeout in ms (default: 10000)
   * @param {number} [options.maxRetries] Retries on rate limits (default: 3)
   */
  constructor(options = {}) {
    this.logger = new Logger(options.logLevel);
    this.http = new HTTPClient({
      cookie: options.cookie,
      logger: this.logger,
      timeout: options.timeout,
      useProxy: options.useProxy,
      maxRetries: options.maxRetries,
    });
  }

  // ─── Gamepass Operations ───────────────────────────────────────────────────

  /**
   * Extract gamepass IDs and URLs from a string.
   * @param {string} text Text containing Roblox gamepass links
   */
  extractGamepassIds(text) {
    return gamepass.extractGamepassIds(text);
  }

  /**
   * Fetch gamepass basic information (name & price).
   * @param {string|number} id Gamepass ID
   */
  fetchGamepassInfo(id) {
    return gamepass.fetchGamepassInfo(this.http, id);
  }

  /**
   * Fetch advanced gamepass details, including regional pricing status & sale status.
   * @param {string|number} id Gamepass ID
   */
  fetchGamepassDetails(id) {
    return gamepass.fetchGamepassDetails(this.http, id);
  }

  /**
   * Checks if a Roblox user owns a gamepass.
   * @param {string|number} userId User ID
   * @param {string|number} gamepassId Gamepass ID
   */
  checkUserOwnsGamepass(userId, gamepassId) {
    return gamepass.checkUserOwnsGamepass(this.http, userId, gamepassId);
  }

  // ─── User Operations ───────────────────────────────────────────────────────

  /**
   * Resolves a Roblox username to details { id, username, displayName }.
   * @param {string} username Username
   */
  fetchRobloxUser(username) {
    return user.fetchRobloxUser(this.http, username);
  }

  /**
   * Fetches the avatar headshot image URL for a user.
   * @param {string|number} userId User ID
   */
  fetchRobloxUserAvatar(userId) {
    return user.fetchRobloxUserAvatar(this.http, userId);
  }

  /**
   * Fetches the full profile details of a user.
   * @param {string|number} userId User ID
   */
  fetchUserDetails(userId) {
    return user.fetchUserDetails(this.http, userId);
  }

  /**
   * Fetches online status, presence, place details for a list of users.
   * @param {number[]} userIds Array of Roblox User IDs
   */
  fetchUserPresence(userIds) {
    return user.fetchUserPresence(this.http, userIds);
  }

  /**
   * Validates the loaded .ROBLOSECURITY cookie and gets authenticated details + Robux balance.
   */
  validateCookie() {
    return user.validateCookie(this.http);
  }

  // ─── Group Operations ──────────────────────────────────────────────────────

  /**
   * Checks if a user is a member of a group.
   * @param {string|number} userId User ID
   * @param {string|number} groupId Group ID
   */
  checkGroupMembership(userId, groupId) {
    return group.checkGroupMembership(this.http, userId, groupId);
  }

  /**
   * Checks a user's exact role and rank in a group.
   * @param {string|number} userId User ID
   * @param {string|number} groupId Group ID
   * @returns {Promise<{ id: number, name: string, rank: number } | null>}
   */
  fetchUserGroupRole(userId, groupId) {
    return group.fetchUserGroupRole(this.http, userId, groupId);
  }

  /**
   * Lists all roles and ranks defined in a group.
   * @param {string|number} groupId Group ID
   */
  fetchGroupRoles(groupId) {
    return group.fetchGroupRoles(this.http, groupId);
  }

  /**
   * Retrieves all members of a group (supports pagination).
   * @param {string|number} groupId Group ID
   * @param {object} [options] Pagination options
   * @param {boolean} [options.recursive] Default: true (lists all members recursively)
   * @param {string} [options.cursor] Starting page cursor
   * @param {number} [options.limit] Max users per request (default: 100)
   */
  fetchGroupMembers(groupId, options) {
    return group.fetchGroupMembers(this.http, groupId, options);
  }

  // ─── Badge Operations ──────────────────────────────────────────────────────

  /**
   * Fetch badge basic info.
   * @param {string|number} badgeId Badge ID
   */
  fetchBadgeInfo(badgeId) {
    return badge.fetchBadgeInfo(this.http, badgeId);
  }

  /**
   * Verify if a user has been awarded one or more badges.
   * @param {string|number} userId User ID
   * @param {string|number|Array<string|number>} badgeIds Badge ID(s)
   */
  checkUserOwnsBadge(userId, badgeIds) {
    return badge.checkUserOwnsBadge(this.http, userId, badgeIds);
  }

  // ─── Catalog & Economy Operations ──────────────────────────────────────────

  /**
   * Fetch detailed metadata of multiple catalog items.
   * @param {object|object[]} items Array of `{ id, itemType }` items
   */
  fetchCatalogItemsDetails(items) {
    return catalog.fetchCatalogItemsDetails(this.http, items);
  }

  /**
   * Fetch metadata of a single catalog asset.
   * @param {string|number} assetId Asset ID
   */
  fetchAssetDetails(assetId) {
    return catalog.fetchAssetDetails(this.http, assetId);
  }

  /**
   * Check if a user owns a catalog asset.
   * @param {string|number} userId User ID
   * @param {string|number} assetId Asset ID
   */
  checkUserOwnsAsset(userId, assetId) {
    return catalog.checkUserOwnsAsset(this.http, userId, assetId);
  }

  // ─── Game & Universe Operations ────────────────────────────────────────────

  /**
   * Fetch universe statistics and details (active players, visits, creator).
   * @param {string|number} universeId Universe ID
   */
  fetchUniverseInfo(universeId) {
    return game.fetchUniverseInfo(this.http, universeId);
  }

  /**
   * Lists public running game servers for a Place ID.
   * @param {string|number} placeId Place ID
   * @param {object} [options] Filter options
   * @param {number} [options.limit] Max servers to fetch (default: 10)
   * @param {string} [options.cursor] Page cursor
   * @param {string} [options.sortOrder] 'Asc' or 'Desc'
   */
  fetchGameServers(placeId, options) {
    return game.fetchGameServers(this.http, placeId, options);
  }
}

module.exports = RobloxClient;

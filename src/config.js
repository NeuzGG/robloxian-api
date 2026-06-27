/**
 * Default configurations for the robloxian-api library.
 */

module.exports = {
  // Time before a request is aborted
  DEFAULT_TIMEOUT_MS: 10000,

  // Default User-Agent to avoid getting flagged as a malicious bot
  DEFAULT_USER_AGENT: 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

  // Standard domains we support
  DOMAINS: {
    roblox: 'roblox.com',
    roproxy: 'roproxy.com'
  },

  // Subdomains often queried in Roblox ecosystem
  SUBDOMAINS: {
    apis: 'apis',
    users: 'users',
    groups: 'groups',
    thumbnails: 'thumbnails',
    inventory: 'inventory',
    games: 'games',
    badges: 'badges',
    economy: 'economy'
  }
};

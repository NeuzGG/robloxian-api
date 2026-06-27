# robloxian-api

<p align="center">
  <img src="https://img.shields.io/npm/v/robloxian-api?style=for-the-badge&color=brightgreen" alt="version" />
  <img src="https://img.shields.io/npm/l/robloxian-api?style=for-the-badge&color=blue" alt="license" />
  <img src="https://img.shields.io/github/stars/NeuzGG/robloxian-api?style=for-the-badge&color=yellow" alt="stars" />
</p>

An advanced, modern, lightweight, and structured Roblox API wrapper for Node.js. It features a failover proxy engine, rate-limit auto-retries, automatic CSRF token management, and built-in TypeScript declarations. Designed specifically for Roblox bot developers and web integrations.

Authored by **[NeuzGG](https://github.com/NeuzGG)**.

---

## 🚀 Key Features

*   **Zero External Dependencies** — Built entirely using standard Node.js native `fetch` (requires Node.js 18+).
*   **Failover Proxy System** — Automatically rotates between `RoProxy` and direct Roblox APIs to bypass network restrictions or blocks.
*   **Auto-Retry & Rate-Limit Backoff** — Automatically waits and retries requests when hitting HTTP `429 (Too Many Requests)` rate limits.
*   **Automatic CSRF-Token Handshaking** — Authenticated requests automatically resolve, fetch, cache, and apply `X-CSRF-TOKEN` headers.
*   **Class & Functional API Options** — Instantiate multiple isolated client classes or make quick, direct functional calls using default settings.
*   **TypeScript Ready** — Packed with robust typing definitions (`index.d.ts`) and editor JSDoc comments for effortless coding.

---

## 📦 Installation

```bash
npm install robloxian-api
```

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root of your project:

```env
# Authenticated cookies (Required for some details & ownership endpoints)
ROBLOX_COOKIE=your_roblosecurity_cookie_here

# Logger level: debug, info, warn, error, none (Default: info)
LOG_LEVEL=info
```

---

## 🛠️ Usage Examples

### 1. Functional API Shorthand (Uses `.env` values)

```javascript
const { 
  fetchRobloxUser, 
  checkUserOwnsGamepass,
  fetchGamepassDetails 
} = require('robloxian-api');

(async () => {
  // 1. Resolve a username to id
  const user = await fetchRobloxUser('BuildintoGames');
  if (user) {
    console.log(`Resolved User: ${user.displayName} (ID: ${user.id})`);
    
    // 2. Check gamepass eligibility / ownership
    const gamepassId = 12345678;
    const ownsPass = await checkUserOwnsGamepass(user.id, gamepassId);
    console.log(`Owns Gamepass: ${ownsPass}`);
  }

  // 3. Fetch detailed gamepass info
  const details = await fetchGamepassDetails(12345678);
  console.log(`Gamepass Info:`, details);
})();
```

### 2. Class-based API Client (Multi-instance / Custom options)

```javascript
const { RobloxClient } = require('robloxian-api');

const client = new RobloxClient({
  cookie: 'YOUR_ROBLOSECURITY_COOKIE',
  useProxy: true, // Will query roproxy.com first
  logLevel: 'debug',
  timeout: 5000 // 5 seconds
});

(async () => {
  // Validate cookie and fetch account balance
  const authStatus = await client.validateCookie();
  if (authStatus.valid) {
    console.log(`Logged in as: ${authStatus.username}`);
    console.log(`Robux Balance: ${authStatus.robux} R$`);
  }

  // Fetch universe active players and visits
  const universe = await client.fetchUniverseInfo(654321);
  console.log(`Active Players: ${universe.playing} | Visits: ${universe.visits}`);
})();
```

---

## 📖 API Documentation Reference

All functions are available both as exported functional shorthands and as methods on the `RobloxClient` class instance.

### Gamepass Service
*   `extractGamepassIds(text: string)` — Extracts gamepass links/IDs from text.
*   `fetchGamepassInfo(id: string|number)` — Retrieves basic gamepass name and price.
*   `fetchGamepassDetails(id: string|number)` — Retrieves advanced gamepass specifications (price, regional pricing indicator, and for-sale status).
*   `checkUserOwnsGamepass(userId: string|number, gamepassId: string|number)` — Checks user inventory for gamepass ownership.

### User Service
*   `fetchRobloxUser(username: string)` — Resolves username to `{ id, username, displayName }`.
*   `fetchRobloxUserAvatar(userId: string|number)` — Retrieves avatar headshot thumbnail URL.
*   `fetchUserDetails(userId: string|number)` — Fetches full public profile details.
*   `fetchUserPresence(userIds: number[])` — Fetches online presence (Online/Offline/In Game/In Studio) for up to 100 users.
*   `validateCookie()` — Checks the current client's login session and retrieves Robux balance.

### Group Service
*   `checkGroupMembership(userId: string|number, groupId: string|number)` — Checks if user is in a group.
*   `fetchUserGroupRole(userId: string|number, groupId: string|number)` — Checks user's role ID, rank, and role name.
*   `fetchGroupRoles(groupId: string|number)` — Lists all roles and ranks in a group.
*   `fetchGroupMembers(groupId: string|number, options?: { recursive?: boolean })` — Paginated group member lists.

### Badge Service
*   `fetchBadgeInfo(badgeId: string|number)` — Retrieves badge description, award statistics, and win rate.
*   `checkUserOwnsBadge(userId: string|number, badgeId: string|number | Array<string|number>)` — Verifies badge ownership (supports checking single or multiple badges at once).

### Catalog Service
*   `fetchAssetDetails(assetId: string|number)` — Retrieves detailed catalog catalog info for a garment, accessory, bundle, etc.
*   `checkUserOwnsAsset(userId: string|number, assetId: string|number)` — Checks user inventory for catalog item ownership.

### Game Service
*   `fetchUniverseInfo(universeId: string|number)` — Fetches active playcounts, visits, place names, and creator details.
*   `fetchGameServers(placeId: string|number, options?: { limit?: number })` — Lists public running game servers, player count, fps, and latency.

---

## 📜 License

MIT License. Designed by **[NeuzGG](https://github.com/NeuzGG)**. Feel free to use and distribute.

export interface ClientOptions {
  /** Roblox .ROBLOSECURITY cookie for authenticated API requests */
  cookie?: string;
  /** Logging severity level: debug, info, warn, error, none (default: info) */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  /** Whether to send requests to RoProxy before falling back to Roblox APIs (default: true) */
  useProxy?: boolean;
  /** Fetch timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Max retries when encountering HTTP 429 rate limits (default: 3) */
  maxRetries?: number;
}

export interface GamepassInfo {
  name: string;
  price: number;
}

export interface GamepassDetails {
  id: string;
  name: string;
  price: number;
  regionalPricing: boolean;
  accessible: boolean;
}

export interface RobloxUser {
  id: number;
  username: string;
  displayName: string;
}

export interface UserDetails {
  id: number;
  username: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  hasVerifiedBadge: boolean;
}

export interface UserPresence {
  userId: number;
  status: number;
  statusText: 'Offline' | 'Online' | 'In Game' | 'In Studio';
  lastOnline: string;
  placeId: number | null;
  gameId: string | null;
}

export interface CookieValidation {
  valid: boolean;
  id?: number;
  username?: string;
  displayName?: string;
  robux?: number;
}

export interface GroupRole {
  id: number;
  name: string;
  rank: number;
  memberCount?: number;
}

export interface GroupMembersResult {
  members: RobloxUser[];
  nextPageCursor: string | null;
}

export interface BadgeInfo {
  id: number;
  name: string;
  description: string;
  displayName: string;
  iconImageId: number;
  isEnabled: boolean;
  awardCount: number;
  winRate: number;
}

export interface CatalogItemDetails {
  id: number;
  itemType: 'Asset' | 'Bundle';
  assetType?: number;
  name: string;
  description: string;
  price?: number;
  lowestPrice?: number;
  priceStatus?: string;
  creatorTargetId?: number;
  creatorType?: 'User' | 'Group';
  creatorName?: string;
  genres?: string[];
  itemStatus?: string[];
  itemRestrictions?: string[];
}

export interface UniverseInfo {
  id: number;
  name: string;
  description: string;
  creatorId: number;
  creatorName: string;
  creatorType: string;
  price: number;
  visits: number;
  playing: number;
  maxPlayers: number;
  created: string;
  updated: string;
}

export interface GameServer {
  id: string;
  maxPlayers: number;
  playing: number;
  fps: number;
  ping: number;
}

export interface GameServersResult {
  servers: GameServer[];
  nextPageCursor: string | null;
}

export class RobloxClient {
  constructor(options?: ClientOptions);

  // Gamepass
  extractGamepassIds(text: string): { id: string; url: string }[];
  fetchGamepassInfo(id: string | number): Promise<GamepassInfo | null>;
  fetchGamepassDetails(id: string | number): Promise<GamepassDetails | null>;
  checkUserOwnsGamepass(userId: string | number, gamepassId: string | number): Promise<boolean>;

  // User
  fetchRobloxUser(username: string): Promise<RobloxUser | null>;
  fetchRobloxUserAvatar(userId: string | number): Promise<string | null>;
  fetchUserDetails(userId: string | number): Promise<UserDetails | null>;
  fetchUserPresence(userIds: number[]): Promise<UserPresence[] | null>;
  validateCookie(): Promise<CookieValidation>;

  // Group
  checkGroupMembership(userId: string | number, groupId: string | number): Promise<boolean>;
  fetchUserGroupRole(userId: string | number, groupId: string | number): Promise<GroupRole | null>;
  fetchGroupRoles(groupId: string | number): Promise<GroupRole[] | null>;
  fetchGroupMembers(
    groupId: string | number,
    options?: { recursive?: boolean; cursor?: string; limit?: number }
  ): Promise<GroupMembersResult>;

  // Badge
  fetchBadgeInfo(badgeId: string | number): Promise<BadgeInfo | null>;
  checkUserOwnsBadge(userId: string | number, badgeId: string | number): Promise<boolean>;
  checkUserOwnsBadge(userId: string | number, badgeIds: (string | number)[]): Promise<Record<string, boolean>>;

  // Catalog/Economy
  fetchCatalogItemsDetails(items: { id: string | number; itemType?: 'Asset' | 'Bundle' | number }[]): Promise<CatalogItemDetails[] | null>;
  fetchAssetDetails(assetId: string | number): Promise<CatalogItemDetails | null>;
  checkUserOwnsAsset(userId: string | number, assetId: string | number): Promise<boolean>;

  // Game/Universe
  fetchUniverseInfo(universeId: string | number): Promise<UniverseInfo | null>;
  fetchGameServers(
    placeId: string | number,
    options?: { limit?: number; cursor?: string; sortOrder?: 'Asc' | 'Desc' }
  ): Promise<GameServersResult | null>;
}

// Default export mappings for bound functions
export function extractGamepassIds(text: string): { id: string; url: string }[];
export function fetchGamepassInfo(id: string | number): Promise<GamepassInfo | null>;
export function fetchGamepassDetails(id: string | number): Promise<GamepassDetails | null>;
export function checkUserOwnsGamepass(userId: string | number, gamepassId: string | number): Promise<boolean>;

export function fetchRobloxUser(username: string): Promise<RobloxUser | null>;
export function fetchRobloxUserAvatar(userId: string | number): Promise<string | null>;
export function fetchUserDetails(userId: string | number): Promise<UserDetails | null>;
export function fetchUserPresence(userIds: number[]): Promise<UserPresence[] | null>;
export function validateCookie(): Promise<CookieValidation>;

export function checkGroupMembership(userId: string | number, groupId: string | number): Promise<boolean>;
export function fetchUserGroupRole(userId: string | number, groupId: string | number): Promise<GroupRole | null>;
export function fetchGroupRoles(groupId: string | number): Promise<GroupRole[] | null>;
export function fetchGroupMembers(
  groupId: string | number,
  options?: { recursive?: boolean; cursor?: string; limit?: number }
): Promise<GroupMembersResult>;

export function fetchBadgeInfo(badgeId: string | number): Promise<BadgeInfo | null>;
export function checkUserOwnsBadge(userId: string | number, badgeId: string | number): Promise<boolean>;
export function checkUserOwnsBadge(userId: string | number, badgeIds: (string | number)[]): Promise<Record<string, boolean>>;

export function fetchCatalogItemsDetails(items: { id: string | number; itemType?: 'Asset' | 'Bundle' | number }[]): Promise<CatalogItemDetails[] | null>;
export function fetchAssetDetails(assetId: string | number): Promise<CatalogItemDetails | null>;
export function checkUserOwnsAsset(userId: string | number, assetId: string | number): Promise<boolean>;

export function fetchUniverseInfo(universeId: string | number): Promise<UniverseInfo | null>;
export function fetchGameServers(
  placeId: string | number,
  options?: { limit?: number; cursor?: string; sortOrder?: 'Asc' | 'Desc' }
): Promise<GameServersResult | null>;

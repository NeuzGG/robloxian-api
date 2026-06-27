/**
 * Service for Roblox Catalog items details, economy checks, and asset ownership.
 */

/**
 * Fetches details for one or more catalog items (Asset or Bundle).
 * Item Type: 'Asset' or 'Bundle'
 * @param {HTTPClient} http HTTP client instance
 * @param {object|object[]} items A single item object `{ id, itemType }` or an array of items
 * @returns {Promise<object[] | null>} Array of catalog item detail objects
 */
async function fetchCatalogItemsDetails(http, items) {
  const list = Array.isArray(items) ? items : [items];
  if (list.length === 0) return [];

  const bodyItems = list.map((item) => ({
    itemType: item.itemType === 'Bundle' || item.itemType === 2 ? 'Bundle' : 'Asset',
    id: Number(item.id),
  }));

  const data = await http.request('catalog', '/v1/catalog/items/details', {
    method: 'POST',
    body: { items: bodyItems },
    authenticated: false,
  });

  if (data && data.data) {
    return data.data;
  }
  return null;
}

/**
 * Helper to fetch details for a single asset.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} assetId Roblox Asset ID
 * @returns {Promise<object | null>} Detailed asset object
 */
async function fetchAssetDetails(http, assetId) {
  const result = await fetchCatalogItemsDetails(http, { id: assetId, itemType: 'Asset' });
  if (result && result.length > 0) {
    return result[0];
  }
  return null;
}

/**
 * Checks if a specific user owns a catalog asset.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @param {string|number} assetId Roblox Asset ID
 * @returns {Promise<boolean>}
 */
async function checkUserOwnsAsset(http, userId, assetId) {
  const result = await http.request('inventory', `/v1/users/${userId}/items/Asset/${assetId}/is-owned`);
  return result === true || String(result) === 'true';
}

module.exports = {
  fetchCatalogItemsDetails,
  fetchAssetDetails,
  checkUserOwnsAsset,
};

/**
 * Service for Roblox Gamepass details, URL extraction, and ownership checks.
 */

/**
 * Extract all gamepass IDs found inside a block of text/links.
 * Supports:
 *   https://www.roblox.com/game-pass/12345678
 *   https://www.roblox.com/game-passes/12345678/SomeName
 * Bare IDs are intentionally not extracted.
 * @param {string} text
 * @returns {{ id: string, url: string }[]}
 */
function extractGamepassIds(text) {
  if (!text) return [];

  const regex =
    /(https?:\/\/[^\s]*roblox\.com\/game-pass(?:es)?\/(\d+)(?:\/[^\s]*)?)/gi;

  const seen = new Set();
  const results = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const id = match[2];
    if (!seen.has(id)) {
      seen.add(id);
      results.push({ url: match[0], id });
    }
  }

  return results;
}

/**
 * Fetch basic gamepass name & price from Roblox product-info.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} id Gamepass ID
 * @returns {Promise<{ name: string, price: number } | null>}
 */
async function fetchGamepassInfo(http, id) {
  const data = await http.request('apis', `/game-passes/v1/game-passes/${id}/product-info`);
  if (!data) return null;

  const price =
    data.UserBasePriceInRobux ??
    data.userBasePriceInRobux ??
    data.PriceInRobux ??
    data.priceInRobux ??
    data.Price ??
    data.price ??
    data.priceInformation?.defaultPriceInRobux ??
    data.priceInformation?.DefaultPriceInRobux ??
    0;

  const name =
    data.Name ??
    data.name ??
    data.displayName ??
    data.DisplayName ??
    `Gamepass #${id}`;

  return { name, price: Number(price) };
}

/**
 * Fetch detailed gamepass info including accessibility (for sale) and regional pricing.
 * Requires ROBLOX_COOKIE for precise details, otherwise uses heuristic fallback.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} id Gamepass ID
 * @returns {Promise<{
 *   id: string,
 *   name: string,
 *   price: number,
 *   regionalPricing: boolean,
 *   accessible: boolean
 * } | null>}
 */
async function fetchGamepassDetails(http, id) {
  const fetches = [http.request('apis', `/game-passes/v1/game-passes/${id}/product-info`)];
  
  if (http.cookie) {
    fetches.push(http.request('apis', `/game-passes/v1/game-passes/${id}/details`));
  }

  const [productData, detailData = null] = await Promise.all(fetches);

  if (!productData) {
    http.logger.warn(`No product info returned for gamepass ${id}`);
    return null;
  }

  const price = Number(
    productData.UserBasePriceInRobux ??
    productData.userBasePriceInRobux ??
    productData.PriceInRobux ??
    productData.priceInRobux ??
    productData.Price ??
    productData.price ??
    productData.priceInformation?.defaultPriceInRobux ??
    productData.priceInformation?.DefaultPriceInRobux ??
    0
  );

  const name =
    productData.Name ??
    productData.name ??
    productData.displayName ??
    productData.DisplayName ??
    `Gamepass #${id}`;

  let regionalPricing = false;

  if (detailData) {
    const features = detailData.enabledFeatures ?? 
                     detailData.EnabledFeatures ?? 
                     detailData.priceInformation?.enabledFeatures ?? 
                     detailData.priceInformation?.EnabledFeatures ?? 
                     detailData.PriceInformation?.enabledFeatures ?? 
                     detailData.PriceInformation?.EnabledFeatures ?? 
                     [];
                     
    regionalPricing = Array.isArray(features) && features.some((f) =>
      typeof f === 'string'
        ? f.toLowerCase().includes('regional')
        : (f?.name ?? f?.Name ?? '').toLowerCase().includes('regional')
    );

    if (regionalPricing === false && detailData.hasRegionalPricing != null) {
      regionalPricing = Boolean(detailData.hasRegionalPricing);
    }
  } else {
    // Fallback heuristic if no cookie is set
    regionalPricing =
      productData.hasRegionalPricing ??
      productData.HasRegionalPricing ??
      (productData.priceInformation != null ? true : undefined) ??
      true; // Roblox defaults to regional pricing since March 2026
  }

  const forSale =
    productData.IsForSale ??
    productData.isForSale ??
    detailData?.IsForSale ??
    detailData?.isForSale ??
    false;

  return {
    id: String(id),
    name,
    price,
    regionalPricing: Boolean(regionalPricing),
    accessible: Boolean(forSale) && price > 0,
  };
}

/**
 * Checks if a specific Roblox user owns a gamepass.
 * @param {HTTPClient} http HTTP client instance
 * @param {string|number} userId Roblox User ID
 * @param {string|number} gamepassId Gamepass ID
 * @returns {Promise<boolean>}
 */
async function checkUserOwnsGamepass(http, userId, gamepassId) {
  const result = await http.request('inventory', `/v1/users/${userId}/items/GamePass/${gamepassId}/is-owned`);
  return result === true || String(result) === 'true';
}

module.exports = {
  extractGamepassIds,
  fetchGamepassInfo,
  fetchGamepassDetails,
  checkUserOwnsGamepass,
};

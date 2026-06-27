const config = require('../config');
const Logger = require('./logger');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class HTTPClient {
  /**
   * @param {object} [options]
   * @param {string} [options.cookie] Roblox .ROBLOSECURITY cookie
   * @param {Logger} [options.logger] Logger instance
   * @param {number} [options.timeout] Request timeout in ms
   * @param {boolean} [options.useProxy] Whether to attempt RoProxy first (default: true)
   * @param {number} [options.maxRetries] Max retries on rate limits (default: 3)
   */
  constructor(options = {}) {
    this.cookie = options.cookie || process.env.ROBLOX_COOKIE || null;
    this.logger = options.logger || new Logger();
    this.timeout = options.timeout || config.DEFAULT_TIMEOUT_MS;
    this.useProxy = options.useProxy !== false;
    this.maxRetries = options.maxRetries || 3;
    this.csrfToken = null;
  }

  /**
   * Clean cookie string to ensure format is correct.
   */
  getCookieHeader() {
    if (!this.cookie) return null;
    let cleanCookie = this.cookie;
    if (!cleanCookie.startsWith('.ROBLOSECURITY=')) {
      cleanCookie = `.ROBLOSECURITY=${cleanCookie}`;
    }
    return cleanCookie;
  }

  /**
   * Build the standard headers for requests.
   * @param {boolean} includeAuth
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'User-Agent': config.DEFAULT_USER_AGENT,
      'Accept': 'application/json',
    };

    if (includeAuth && this.cookie) {
      headers['Cookie'] = this.getCookieHeader();
    }

    // Roblox requires X-CSRF-TOKEN for all POST/PATCH/DELETE endpoints, even unauthenticated ones.
    if (this.csrfToken) {
      headers['X-CSRF-TOKEN'] = this.csrfToken;
    }

    return headers;
  }

  /**
   * Performs an HTTP request with failover proxy, auto CSRF-token fetching, and 429 retries.
   * @param {string} subdomain Roblox subdomain (e.g. 'users', 'groups', 'apis')
   * @param {string} path API path (e.g. '/v1/users/12345')
   * @param {object} [options] Fetch options (method, body, headers, etc.)
   * @param {boolean} [options.authenticated] Whether request requires authorization (default: true)
   */
  async request(subdomain, path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const authenticated = options.authenticated !== false;

    // Build base URLs to attempt
    const hosts = [];
    if (this.useProxy) {
      hosts.push(`https://${subdomain}.${config.DOMAINS.roproxy}`);
    }
    hosts.push(`https://${subdomain}.${config.DOMAINS.roblox}`);

    let attempt = 0;
    let delay = 2000; // Exponential backoff starts at 2s

    while (attempt < this.maxRetries) {
      let lastStatus = 0;

      for (const host of hosts) {
        const url = `${host}${path}`;
        try {
          // Prepare fresh request headers and body for this attempt (avoid mutating the options parameter)
          const fetchHeaders = {
            ...this.getHeaders(authenticated),
            ...options.headers
          };

          let requestBody = options.body;
          if (requestBody && typeof requestBody === 'object' && !(requestBody instanceof URLSearchParams)) {
            fetchHeaders['Content-Type'] = 'application/json';
            requestBody = JSON.stringify(requestBody);
          }

          this.logger.debug(`${method} ${url}`);

          const response = await fetch(url, {
            ...options,
            method,
            headers: fetchHeaders,
            body: requestBody,
            signal: AbortSignal.timeout(this.timeout)
          });

          lastStatus = response.status;

          // Handle 403 CSRF challenge
          if (response.status === 403 && response.headers.has('x-csrf-token')) {
            const token = response.headers.get('x-csrf-token');
            this.logger.debug(`Retrieved new CSRF Token: ${token}`);
            this.csrfToken = token;

            // Avoid infinite loops if token is repeatedly rejected on the same call
            if (options._csrfRetried) {
              this.logger.warn(`CSRF token rejected by Roblox even after retry.`);
              continue;
            }

            // Retry the same request immediately with the new token
            return this.request(subdomain, path, {
              ...options,
              _csrfRetried: true
            });
          }

          // Handle 429 rate limit
          if (response.status === 429) {
            this.logger.warn(`HTTP 429 (Rate Limited) at ${url}. Trying next host...`);
            continue; // Fallback immediately to the next host
          }

          if (!response.ok) {
            this.logger.warn(`HTTP ${response.status} from ${url}`);
            continue; // Fallback immediately to the next host
          }

          // Try parsing JSON safely. HTML error pages served with status 200 are caught here.
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (jsonErr) {
            this.logger.warn(`Failed to parse JSON response from ${url} (HTML/raw response returned). Trying next host...`);
            continue; // Fallback to next host
          }

        } catch (err) {
          this.logger.error(`Request error [${url}]: ${err.message}`);
          continue; // Fallback to next host
        }
      }

      // If all hosts were rate limited (429), back off before retrying the loop
      if (lastStatus === 429) {
        this.logger.warn(`All hosts rate-limited. Backing off for ${delay}ms...`);
        await sleep(delay);
        attempt++;
        delay *= 2; // exponential backoff
      } else {
        // If we exhausted all hosts with other errors, increment attempt and try again if below maxRetries
        attempt++;
      }
    }
    return null;
  }
}

module.exports = HTTPClient;

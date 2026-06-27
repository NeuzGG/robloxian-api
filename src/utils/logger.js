/**
 * Premium Logger utility for robloxian-api.
 * Provides colorized console output based on severity levels.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

class Logger {
  /**
   * @param {string} [level]
   */
  constructor(level) {
    this.setLevel(level || process.env.LOG_LEVEL || 'info');
  }

  /**
   * Set active logging level.
   * @param {string} level 
   */
  setLevel(level) {
    const norm = String(level).toLowerCase();
    this.level = norm in LOG_LEVELS ? LOG_LEVELS[norm] : LOG_LEVELS.info;
  }

  /**
   * Log debug info.
   * @param {string} msg 
   */
  debug(msg) {
    if (this.level <= LOG_LEVELS.debug) {
      console.log(`${COLORS.gray}[DEBUG] ${msg}${COLORS.reset}`);
    }
  }

  /**
   * Log standard info.
   * @param {string} msg 
   */
  info(msg) {
    if (this.level <= LOG_LEVELS.info) {
      console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${msg}`);
    }
  }

  /**
   * Log warning message.
   * @param {string} msg 
   */
  warn(msg) {
    if (this.level <= LOG_LEVELS.warn) {
      console.log(`${COLORS.yellow}[WARN] ${msg}${COLORS.reset}`);
    }
  }

  /**
   * Log error message.
   * @param {string} msg 
   */
  error(msg) {
    if (this.level <= LOG_LEVELS.error) {
      console.error(`${COLORS.red}${COLORS.bright}[ERROR] ${msg}${COLORS.reset}`);
    }
  }
}

module.exports = Logger;

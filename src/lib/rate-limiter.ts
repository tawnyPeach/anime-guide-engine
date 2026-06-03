/**
 * Rate Limiter Utilities
 * Provides async helpers and rate limiting classes for external API calls.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(minIntervalMs: number) {
    this.minInterval = minIntervalMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.minInterval) {
      await sleep(this.minInterval - elapsed);
    }

    this.lastRequestTime = Date.now();
  }
}

/** Pre-configured limiter for AniList API (1 request per 1.5s) */
export const anilistLimiter = new RateLimiter(1500);

/** Pre-configured limiter for Jikan API (1 request per 350ms) */
export const jikanLimiter = new RateLimiter(350);

// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Caching of pure functions: each part, branch and layout value is computed once.
 *
 * @module
 */

/** Cached results and the items of cached arrays. */
const held = new WeakSet<object>();

function hold<T>(v: T): T {
  if (Array.isArray(v)) v.forEach(hold);
  if (typeof v === 'object' && v !== null) held.add(v);
  return v;
}

/** Whether `obj` is held by a {@link memo} cache; geometry cleanup must not free it. */
export const isMemoized = (obj: object): boolean => held.has(obj);

/**
 * Cache a pure function by its arguments (plain data, compared as JSON). Results are
 * shared between callers: do not mutate them, do not `delete()` cached solids.
 */
export function memo<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, hold(fn(...args)));
    return cache.get(key) as R;
  };
}

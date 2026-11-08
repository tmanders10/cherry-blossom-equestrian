/**
 * Environment detection helper for Cherry Blossom Equestrian
 * - 'prod': cherryblossomequestrian.com or www.cherryblossomequestrian.com
 * - 'test': dev.cherryblossomequestrian.com or Vercel preview deployments
 * - 'dev': Google AI Studio Cloud Run (run.app), localhost, or 127.0.0.1
 */

export function getAppEnvironment() {
  if (typeof window === 'undefined') return 'prod';
  const host = window.location.hostname.toLowerCase();

  // 1. Production live domains - NEVER show test/dev tools
  if (
    host === 'cherryblossomequestrian.com' ||
    host === 'www.cherryblossomequestrian.com'
  ) {
    return 'prod';
  }

  // 2. Test / QA domain
  if (host.includes('dev.cherryblossomequestrian.com')) {
    return 'test';
  }

  // 3. Dev / Sandbox environment (Google AI Studio or local)
  if (
    host.includes('run.app') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1')
  ) {
    return 'dev';
  }

  // 4. Any other Vercel preview deployment (branch preview URLs)
  if (host.includes('vercel.app')) {
    return 'test';
  }

  return 'prod';
}

export function isNonProductionEnvironment() {
  const env = getAppEnvironment();
  return env === 'test' || env === 'dev';
}

/**
 * Helper to get the .manus.space domain for OAuth callbacks
 * This is needed because OAuth only works with registered .manus.space domains
 */
export function getManusSpaceDomain(): string {
  // Try to get from environment first
  const envDomain = import.meta.env.VITE_PREVIEW_URL;
  if (envDomain) {
    return envDomain.startsWith('http') ? envDomain : `https://${envDomain}`;
  }
  
  // Fallback: construct from current origin if it's already .manus.space
  const currentOrigin = window.location.origin;
  if (currentOrigin.includes('.manus.space')) {
    return currentOrigin;
  }
  
  // If we're on a custom domain, we need to make an educated guess
  // The project name pattern is usually: projectname-xxx.manus.space
  // We'll store this in localStorage when first accessed from .manus.space domain
  const stored = localStorage.getItem('_manus_space_domain');
  if (stored) {
    return stored;
  }
  
  // Last resort: return current origin (will fail but at least we tried)
  console.warn('[OAuth] Could not determine .manus.space domain, OAuth may fail');
  return currentOrigin;
}

/**
 * Store the .manus.space domain in localStorage for future use
 * Call this when the app is accessed from a .manus.space domain
 */
export function storeManusSpaceDomain() {
  const currentOrigin = window.location.origin;
  if (currentOrigin.includes('.manus.space')) {
    localStorage.setItem('_manus_space_domain', currentOrigin);
  }
}

/**
 * Check if current domain is a custom domain (not .manus.space)
 */
export function isCustomDomain(): boolean {
  return !window.location.origin.includes('.manus.space');
}

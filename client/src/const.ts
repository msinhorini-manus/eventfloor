export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getManusSpaceDomain, isCustomDomain } from "./lib/domainHelper";

export const APP_TITLE = "ERP Summit | event floor plan";

export const APP_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663111899397/OXmoObZijQMoyIDc.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Optional returnTo parameter to redirect user back to specific page after login
export const getLoginUrl = (returnTo?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  const currentOrigin = window.location.origin;
  
  // Store returnTo in localStorage to avoid URL encoding issues
  const finalReturnTo = returnTo || '/';
  if (finalReturnTo) {
    localStorage.setItem('_oauth_return_to', finalReturnTo);
  }
  
  // Use current domain for OAuth callback (works with both custom and .manus.space domains)
  const callbackUrl = `${currentOrigin}/api/oauth/callback`;
  
  const state = btoa(callbackUrl);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", callbackUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
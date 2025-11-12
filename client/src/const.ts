export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = "ERP Summit | event floor plan";

export const APP_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663111899397/OXmoObZijQMoyIDc.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Optional returnTo parameter to redirect user back to specific page after login
export const getLoginUrl = (returnTo?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Include returnTo in the callback URL if provided
  let callbackUrl = `${window.location.origin}/api/oauth/callback`;
  if (returnTo) {
    callbackUrl += `?returnTo=${encodeURIComponent(returnTo)}`;
  }
  
  const state = btoa(callbackUrl);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", callbackUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
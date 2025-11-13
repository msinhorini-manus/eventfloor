import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Component that handles OAuth redirect after successful login
 * Reads returnTo from localStorage and redirects user to intended destination
 */
export function OAuthRedirectHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const returnTo = localStorage.getItem('_oauth_return_to');
    if (returnTo) {
      // Clear the stored value
      localStorage.removeItem('_oauth_return_to');
      
      // Redirect to the stored location
      if (returnTo !== '/' && returnTo !== window.location.pathname) {
        setLocation(returnTo);
      }
    }
  }, [setLocation]);

  return null;
}

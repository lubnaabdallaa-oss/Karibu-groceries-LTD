/**
 * File purpose: Shared frontend utility functions for API communication, 
 * session management, and route handling.
 */

// Determine if the app is running on a local environment to set the API base URL.
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = isLocalhost
  ? `${window.location.protocol}//${window.location.hostname}:5000` // Backend runs on port 5000
  : "";

// Determine the base path for pages to handle different hosting scenarios (e.g., /public/ or /kgl-frontend/public/).
const PAGE_BASE = window.location.pathname.startsWith("/kgl-frontend/public/")
  ? "/kgl-frontend/public"
  : window.location.pathname.startsWith("/public/")
    ? "/public"
    : "";

/**
 * Global APP object containing helper methods for the frontend.
 */
const APP = {
  /**
   * Saves the user session and token to local storage after a successful login.
   */
  setSession(data) {
    localStorage.setItem("KGL_SESSION", JSON.stringify(data));
    localStorage.setItem("KGL_TOKEN", data.token);
  },

  /**
   * Retrieves the current session data from local storage.
   */
  getSession() {
    return JSON.parse(localStorage.getItem("KGL_SESSION") || "null");
  },

  /**
   * Retrieves the stored JWT token from local storage.
   */
  getToken() {
    return localStorage.getItem("KGL_TOKEN") || "";
  },

  /**
   * Clears all session-related data from local storage (logout/expired).
   */
  clearSession() {
    localStorage.removeItem("KGL_SESSION");
    localStorage.removeItem("KGL_TOKEN");
  },

  /**
   * Protects frontend pages by verifying the user's role.
   * Redirects to login if the user is not authenticated or lacks the required role.
   */
  ensureRole(roles) {
    const session = APP.getSession();
    const role = session && session.user ? session.user.role : null;
    if (!role || !roles.includes(role)) {
      console.warn("Access denied. Role mismatch or no session. Redirecting to login...");
      window.location.href = APP.page("/login.html");
      return { user: { role: "", fullName: "", username: "", branch: "" } };
    }
    return session;
  },

  /**
   * Normalizes a page path by prepending the appropriate PAGE_BASE.
   */
  page(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (normalized.startsWith("/kgl-frontend/public/") || normalized.startsWith("/public/")) {
      return normalized;
    }
    return `${PAGE_BASE}${normalized}`;
  },

  /**
   * A wrapper around the fetch API for making authenticated requests to the backend.
   * Automatically adds the Authorization header if a token exists.
   * Handles 401 Unauthorized errors by clearing the session and redirecting to login.
   */
  async api(path, options = {}) {
    const token = APP.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Attach JWT token
      ...(options.headers || {}),
    };
    const target = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const response = await fetch(target, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    // Check for HTTP errors.
    if (!response.ok) {
      // If unauthorized (401), force a logout and redirect.
      if (response.status === 401 && !path.includes("/auth/login")) {
        console.error("API 401: Clearing session and redirecting to login...");
        APP.clearSession();
        // Prevent multiple redirects if several requests fail simultaneously.
        if (!window.location.pathname.includes("/login.html")) {
          window.location.href = APP.page("/login.html");
        }
      }
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },

  /**
   * Formats a numeric value into a UGX currency string.
   */
  currency(value) {
    return `UGX ${Number(value || 0).toLocaleString()}`;
  },
};


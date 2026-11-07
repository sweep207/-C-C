/* Public configuration only. Never place API keys, passwords or private tokens here. */
window.LOCKET_CONFIG = Object.freeze({
  API_BASE_URL: "https://YOUR-API-DOMAIN.example",
  ENDPOINTS: Object.freeze({
    login: "/auth/locket_license",
    logout: "/auth/logout",
    friends: "/locket/friends",
    moments: "/locket/moments",
    profile: "/locket/profile",
    upload: "/locket/upload"
  })
});

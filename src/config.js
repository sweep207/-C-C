const publicConfig = window.LOCKET_CONFIG || {};
export const CONFIG = Object.freeze({
  API_BASE_URL: String(publicConfig.API_BASE_URL || "").replace(/\/$/, ""),
  ENDPOINTS: Object.freeze({
    login: publicConfig.ENDPOINTS?.login || "/auth/locket_license",
    logout: publicConfig.ENDPOINTS?.logout || "/auth/logout",
    friends: publicConfig.ENDPOINTS?.friends || "/locket/friends",
    moments: publicConfig.ENDPOINTS?.moments || "/locket/moments",
    profile: publicConfig.ENDPOINTS?.profile || "/locket/profile",
    upload: publicConfig.ENDPOINTS?.upload || "/locket/upload"
  })
});

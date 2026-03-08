import axios from "axios";
import { supabase } from "../supabaseClient";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080", // Spring Boot
});

// Cache last known token so a transient Supabase outage does not lose read auth.
let cachedToken = null;
let cachedUserId = null;

const isPublicEndpoint = (url = "", method = "GET") => {
    const normalizedPath = url.split("?")[0].replace(/\/$/, "");
    const httpMethod = method.toUpperCase();

    if (normalizedPath.startsWith("/api/auth/") || normalizedPath.startsWith("/api/files/")) {
        return true;
    }

    if (normalizedPath === "/api/rides/search" && httpMethod === "GET") {
        return true;
    }

    // Ride publishing is intentionally public and uses driverEmail in payload.
    if (normalizedPath === "/api/rides" && httpMethod === "POST") {
        return true;
    }

    // Only ride detail lookup is public (e.g. /api/rides/123).
    // Keep authenticated ride endpoints (my-rides, my-bookings, etc.) protected.
    const isPublicRideDetail = /^\/api\/rides\/\d+$/.test(normalizedPath);
    if (isPublicRideDetail && httpMethod === "GET") {
        return true;
    }

    if (normalizedPath.startsWith("/api/vehicles") && httpMethod === "GET") {
        return true;
    }

    return false;
};

// This runs BEFORE every backend request
axiosClient.interceptors.request.use(
    async (config) => {
        if (isPublicEndpoint(config.url, config.method)) {
            return config;
        }

        const method = (config.method || "GET").toUpperCase();
        const isMutation = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

        try {
            const { data } = await supabase.auth.getSession();

            if (data?.session?.access_token) {
                cachedToken = data.session.access_token;
                cachedUserId = data.session.user?.id || null;
                config.headers.Authorization = `Bearer ${cachedToken}`;
                console.debug("[axiosClient] Token set from session, user:", data.session.user?.email);
            } else if (cachedToken && !isMutation) {
                // For writes, never fallback to stale cached token to avoid wrong-user actions.
                config.headers.Authorization = `Bearer ${cachedToken}`;
                console.debug("[axiosClient] Token set from cache, userId:", cachedUserId);
            } else {
                console.warn("[axiosClient] No token available - request will be unauthenticated");
            }
        } catch (error) {
            console.warn("[axiosClient] Session fetch failed:", error);
            if (cachedToken && !isMutation) {
                config.headers.Authorization = `Bearer ${cachedToken}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Log 401 responses for debugging
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error(
                "[axiosClient] 401 Unauthorized on:",
                error.config?.url,
                "- Token present:",
                !!error.config?.headers?.Authorization,
                "- CachedToken present:",
                !!cachedToken
            );
        }
        return Promise.reject(error);
    }
);

export default axiosClient;

// Soft env — empty strings instead of throwing so `next build` works even
// before the user has wired up their Sanity project. Consumer modules check
// `isConfigured` and fall back to placeholder UI.

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const token = process.env.SANITY_API_READ_TOKEN || "";

export const isConfigured = projectId.length > 0;

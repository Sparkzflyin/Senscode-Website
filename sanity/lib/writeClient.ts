import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isConfigured, projectId } from "../env";

let cached: SanityClient | null = null;

// Server-only Sanity client with write access. Reads drafts (perspective:
// "raw") so the owner's review queue can see pending submissions. The token
// must be an Editor-level token created in sanity.io/manage and stored in
// SANITY_API_WRITE_TOKEN — never expose this client to the browser.
export function getWriteClient(): SanityClient | null {
  if (!isConfigured) return null;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;
  if (cached) return cached;
  cached = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    perspective: "raw",
    stega: false,
  });
  return cached;
}

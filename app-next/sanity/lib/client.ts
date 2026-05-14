import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isConfigured, projectId } from "../env";

let cached: SanityClient | null = null;

export function getClient(): SanityClient | null {
  if (!isConfigured) return null;
  if (cached) return cached;
  cached = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
    stega: false,
  });
  return cached;
}

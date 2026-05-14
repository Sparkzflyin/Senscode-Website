import { getClient } from "./client";
import {
  ALL_POSTS_QUERY,
  CATEGORIES_WITH_POSTS_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  CATEGORY_SLUGS_QUERY,
  POST_BY_SLUG_QUERY,
  POST_SITEMAP_QUERY,
  POST_SLUGS_QUERY,
  POSTS_BY_CATEGORY_QUERY,
} from "./queries";
import type { Image } from "sanity";

export type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  readTime?: number;
  coverImage?: Image & { alt?: string };
  publishedAt: string;
  author?: { name: string; slug: string; avatar?: Image };
  categories?: Array<{ title: string; slug: string }>;
};

export type PostDetail = PostSummary & {
  body: unknown;
  author?: PostSummary["author"] & {
    bio?: string;
    social?: {
      github?: string;
      linkedin?: string;
      instagram?: string;
      website?: string;
    };
  };
};

export async function getAllPosts(): Promise<PostSummary[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<PostSummary[]>(
    ALL_POSTS_QUERY,
    {},
    { next: { revalidate: 60, tags: ["post"] } },
  );
}

export async function getPostBySlug(
  slug: string,
): Promise<PostDetail | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch<PostDetail | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60, tags: [`post:${slug}`] } },
  );
}

export async function getAllPostSlugs(): Promise<string[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<string[]>(POST_SLUGS_QUERY);
}

export async function getPostsForSitemap(): Promise<
  Array<{ slug: string; lastModified: string }>
> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<Array<{ slug: string; lastModified: string }>>(
    POST_SITEMAP_QUERY,
  );
}

export type CategoryListItem = {
  title: string;
  slug: string;
  postCount: number;
};

export async function getCategoriesWithPosts(): Promise<CategoryListItem[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<CategoryListItem[]>(
    CATEGORIES_WITH_POSTS_QUERY,
    {},
    { next: { revalidate: 60, tags: ["category"] } },
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<{ title: string; slug: string; description?: string } | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    CATEGORY_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60, tags: [`category:${slug}`] } },
  );
}

export async function getPostsByCategory(
  slug: string,
): Promise<PostSummary[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<PostSummary[]>(
    POSTS_BY_CATEGORY_QUERY,
    { slug },
    { next: { revalidate: 60, tags: [`category:${slug}`, "post"] } },
  );
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch<string[]>(CATEGORY_SLUGS_QUERY);
}

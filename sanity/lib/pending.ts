import { groq } from "next-sanity";
import { getWriteClient } from "./writeClient";
import type { Image } from "sanity";

export type PendingPostSummary = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: Image & { alt?: string };
  publishedAt?: string;
  updatedAt: string;
  author?: { name: string; slug?: string; avatar?: Image };
  categories?: Array<{ title: string; slug: string }>;
};

export type PendingPostDetail = PendingPostSummary & {
  body?: unknown;
  author?: PendingPostSummary["author"] & {
    bio?: string;
  };
};

const LIST_QUERY = groq`
  *[_type == "post" && _id in path("drafts.**")] | order(_updatedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    "updatedAt": _updatedAt,
    "author": author->{name, "slug": slug.current, avatar},
    "categories": categories[]->{title, "slug": slug.current}
  }
`;

const COUNT_QUERY = groq`count(*[_type == "post" && _id in path("drafts.**")])`;

const DETAIL_QUERY = groq`
  *[_id == $id][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    body,
    publishedAt,
    "updatedAt": _updatedAt,
    "author": author->{name, "slug": slug.current, avatar, bio},
    "categories": categories[]->{title, "slug": slug.current}
  }
`;

export async function listPendingPosts(): Promise<PendingPostSummary[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch<PendingPostSummary[]>(LIST_QUERY);
}

export async function countPendingPosts(): Promise<number> {
  const client = getWriteClient();
  if (!client) return 0;
  return client.fetch<number>(COUNT_QUERY);
}

export async function getPendingPostById(
  id: string,
): Promise<PendingPostDetail | null> {
  const client = getWriteClient();
  if (!client) return null;
  if (!id.startsWith("drafts.")) return null;
  return client.fetch<PendingPostDetail | null>(DETAIL_QUERY, { id });
}

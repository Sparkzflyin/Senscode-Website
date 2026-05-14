import { groq } from "next-sanity";

export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    "author": author->{name, "slug": slug.current, avatar},
    "categories": categories[]->{title, "slug": slug.current}
  }
`;

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    body,
    publishedAt,
    "author": author->{name, "slug": slug.current, avatar, bio, social},
    "categories": categories[]->{title, "slug": slug.current}
  }
`;

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

export const POST_SITEMAP_QUERY = groq`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    "lastModified": coalesce(_updatedAt, publishedAt)
  }
`;

import { groq } from "next-sanity";

export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    readTime,
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
    readTime,
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

// Categories that have at least one published post attached. Used to render
// the filter chip row on /blog — we don't surface empty categories.
export const CATEGORIES_WITH_POSTS_QUERY = groq`
  *[_type == "category" && defined(slug.current) && count(*[_type == "post" && references(^._id)]) > 0] | order(title asc) {
    title,
    "slug": slug.current,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

export const CATEGORY_BY_SLUG_QUERY = groq`
  *[_type == "category" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description
  }
`;

export const POSTS_BY_CATEGORY_QUERY = groq`
  *[_type == "post" && defined(slug.current) && $slug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    readTime,
    coverImage,
    publishedAt,
    "author": author->{name, "slug": slug.current, avatar},
    "categories": categories[]->{title, "slug": slug.current}
  }
`;

export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "category" && defined(slug.current) && count(*[_type == "post" && references(^._id)]) > 0][].slug.current
`;

import { defineCollection, z } from 'astro:content';

const works = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      thumbnail: image(),
      tags: z.array(z.string()),
      links: z
        .array(
          z.object({
            type: z.enum(['github', 'demo', 'article', 'other']),
            url: z.string().url(),
          })
        )
        .optional(),
      featured: z.boolean().optional(),
    }),
});

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()),
    }),
});

export const collections = { works, blog };

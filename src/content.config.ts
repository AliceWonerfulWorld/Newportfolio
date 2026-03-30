import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // 新しいLoaderをインポート

// Works (作品紹介) の定義
const works = defineCollection({
  // src/content/works/ 配下の md/mdx ファイルをロード
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/works" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    thumbnail: image(),
    tags: z.array(z.string()),
    links: z.array(
      z.object({
        type: z.enum(['github', 'demo', 'article', 'other']),
        url: z.string().url(),
      })
    ).optional(),
    featured: z.boolean().optional().default(false),
  }),
});

// Blog (開発記) の定義
const blog = defineCollection({
  // src/content/blog/ 配下の md/mdx ファイルをロード
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = { works, blog };
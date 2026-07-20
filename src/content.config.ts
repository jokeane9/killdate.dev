import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    part: z.number(),
    post: z.number(),
    section: z.enum(['essays', 'playbook', 'workshop']).optional(),
    group: z.string().optional(),
    draft: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };

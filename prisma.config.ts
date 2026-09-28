import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // `generate` runs at Docker build time, before DATABASE_URL is injected; don't throw if it's unset.
    url: process.env.DATABASE_URL ?? '',
  },
});

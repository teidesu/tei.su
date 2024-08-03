import type { Config } from 'drizzle-kit'

export default {
    out: './drizzle',
    schema: './src/backend/models/index.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: '.runtime/data.db',
    },
} satisfies Config

import 'dotenv/config'

import { z } from 'zod'

import { zodValidateSync } from '~/utils/zod'

export const env = zodValidateSync(
    z.object({
        UMAMI_HOST: z.string().url(),
        UMAMI_TOKEN: z.string(),
        UMAMI_SITE_ID: z.string().uuid(),
        LASTFM_TOKEN: z.string(),
        TG_API_ID: z.coerce.number(),
        TG_API_HASH: z.string(),
        TG_BOT_TOKEN: z.string(),
        TG_CHAT_ID: z.coerce.number(),
        CURRENCY_API_TOKEN: z.string(),
        FAKE_DEEPL_SECRET: z.string(),
        MK_WEBHOOK_SECRET: z.string(),
        QBT_WEBHOOK_SECRET: z.string(),
    }),
    process.env,
)

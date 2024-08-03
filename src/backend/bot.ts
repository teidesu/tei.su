import { Dispatcher } from '@mtcute/dispatcher'
import { TelegramClient } from '@mtcute/node'

import { env } from '~/backend/env'

import { shoutboxDp } from './bot/shoutbox'

export const tg = new TelegramClient({
    apiId: env.TG_API_ID,
    apiHash: env.TG_API_HASH,
    storage: '.runtime/bot.session',
})

const dp = Dispatcher.for(tg)
dp.extend(shoutboxDp)

await tg.start({ botToken: env.TG_BOT_TOKEN })

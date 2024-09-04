// import { telegramNotify } from '~/backend/bot/notify'

import { html } from '@mtcute/node'
import type { APIRoute } from 'astro'

import { env } from '~/backend/env'
import { telegramNotify } from '~/backend/bot/notify'

export const POST: APIRoute = async (ctx) => {
    if (new URL(ctx.request.url).searchParams.get('secret') !== env.QBT_WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 })
    }

    telegramNotify(html`📥 Torrent finished: ${await ctx.request.text()}`)

    return new Response('OK')
}

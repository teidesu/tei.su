import type { APIRoute } from 'astro'
import { html } from '@mtcute/node'

import { isBotUserAgent } from '~/backend/utils/bot'
import { telegramNotify } from '../backend/bot/notify'
import { getRequestIp } from '../backend/utils/request'

const HTML = `
<html>
<head>
<meta name="robots" content="noindex, nofollow" />
<meta name="og:title" content="teidesu > nudes">
<meta name="og:description" content="nudes: 2 directories, 76 files">
<meta name="og:type" content="article">
<meta name="og:site_name" content="tei.su">
</head>
</html>
`.trim()

export const GET: APIRoute = async (ctx) => {
    if (isBotUserAgent(ctx.request.headers.get('user-agent') || '')) {
        return new Response(HTML, {
            headers: {
                'Content-Type': 'text/html',
            },
        })
    }

    telegramNotify(html`someone (ip ${getRequestIp(ctx)}) got rickrolled >:3`)

    return new Response(null, {
        status: 302,
        headers: {
            Location: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
    })
}

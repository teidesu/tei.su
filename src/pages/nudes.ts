import type { APIRoute } from 'astro'

import { isBotUserAgent } from '~/backend/utils/bot'

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

    return new Response(null, {
        status: 302,
        headers: {
            Location: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
    })
}

import type { APIRoute } from 'astro'

import { env } from '~/backend/env'
import { translateChunked } from '~/backend/service/gtrans'

export const POST: APIRoute = async (ctx) => {
    const body = ctx.request.headers.get('content-type') === 'application/json'
        ? await ctx.request.json()
        : Object.fromEntries((await ctx.request.formData()).entries())

    if (body.auth_key !== env.FAKE_DEEPL_SECRET) {
        return new Response('Unauthorized', { status: 401 })
    }

    if (!body.text) {
        return new Response('Bad request', { status: 400 })
    }

    const result = await translateChunked(body.text, 'auto', body.target_lang)

    return new Response(JSON.stringify({
        translations: [
            {
                detected_source_language: result.sourceLanguage,
                text: result.translatedText,
            },
        ],
    }), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

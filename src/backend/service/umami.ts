import { ffetchAddons, ffetchBase } from '@fuman/fetch'
import { ffetchZodAdapter } from '@fuman/fetch/zod'
import { z } from 'zod'

import { isBotUserAgent } from '../utils/bot'
import { env } from '~/backend/env'

const ffetch = ffetchBase.extend({
    addons: [
        ffetchAddons.parser(ffetchZodAdapter()),
        ffetchAddons.timeout(),
    ],
    baseUrl: env.UMAMI_HOST,
    timeout: 1000,
})

export async function umamiFetchStats(page: string, startAt: number) {
    if (import.meta.env.DEV) {
        return Promise.resolve({ visitors: { value: 1337 } })
    }

    return await ffetch(`/api/websites/${env.UMAMI_SITE_ID}/stats`, {
        query: {
            endAt: Math.floor(Date.now()).toString(),
            startAt: startAt.toString(),
            url: page,
        },
        headers: {
            Authorization: `Bearer ${env.UMAMI_TOKEN}`,
        },
    }).parsedJson(z.object({
        visitors: z.object({
            value: z.number(),
        }),
    }))
}

export function umamiLogThisVisit(request: Request, path?: string, website = env.UMAMI_SITE_ID): void {
    if (import.meta.env.DEV) return
    if (isBotUserAgent(request.headers.get('user-agent') || '')) return
    const language = request.headers.get('accept-language')?.split(';')[0].split(',')[0] || ''

    ffetch.post('/api/send', {
        json: {
            payload: {
                hostname: request.headers.get('host') || '',
                language,
                referrer: request.headers.get('referer') || '',
                screen: '',
                title: '',
                url: path ?? new URL(request.url).pathname,
                website,
            },
            type: 'event',
        },
        headers: {
            'User-Agent': request.headers.get('user-agent') || '',
            'X-Forwarded-For': request.headers.get('x-forwarded-for')?.[0] || '',
        },
    }).then(async (r) => {
        if (!r.ok) throw new Error(`failed to log visit: ${r.status} ${await r.text()}`)
    }).catch((err) => {
        console.warn(err)
    })
}

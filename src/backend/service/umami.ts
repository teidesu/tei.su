import { isBotUserAgent } from '../utils/bot'
import { env } from '~/backend/env'

export async function umamiFetchStats(page: string, startAt: number) {
    if (import.meta.env.DEV) {
        return Promise.resolve({ uniques: { value: 1337 } })
    }

    const res = await fetch(`${env.UMAMI_HOST}/api/websites/${env.UMAMI_SITE_ID}/stats?${new URLSearchParams({
        endAt: Math.floor(Date.now()).toString(),
        startAt: startAt.toString(),
        url: page,
    })}`, {
        headers: {
            Authorization: `Bearer ${env.UMAMI_TOKEN}`,
        },
    })

    return await res.json()
}

export function umamiLogThisVisit(request: Request, path?: string, website = env.UMAMI_SITE_ID): void {
    if (import.meta.env.DEV) return
    if (isBotUserAgent(request.headers.get('user-agent') || '')) return
    const language = request.headers.get('accept-language')?.split(';')[0].split(',')[0] || ''

    fetch(`${env.UMAMI_HOST}/api/send`, {
        body: JSON.stringify({
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
        }),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': request.headers.get('user-agent') || '',
            'X-Forwarded-For': request.headers.get('x-forwarded-for')?.[0] || '',
        },
        method: 'POST',
    }).then(async (r) => {
        if (!r.ok) throw new Error(`failed to log visit: ${r.status} ${await r.text()}`)
    }).catch((err) => {
        console.warn(err)
    })
}

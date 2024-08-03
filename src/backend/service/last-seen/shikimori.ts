import { z } from 'zod'

import { Reloadable } from '~/backend/utils/reloadable'
import { zodValidate } from '~/utils/zod'

const ENDPOINT = 'https://shikimori.one/api/users/698215/history?limit=1'
const TTL = 3 * 60 * 60 * 1000 // 3 hours
const STALE_TTL = 8 * 60 * 60 * 1000 // 8 hours

const schema = z.object({
    created_at: z.string(),
    description: z.string(),
    target: z.object({
        name: z.string(),
        url: z.string(),
    }),
})

export const shikimoriLastSeen = new Reloadable<z.infer<typeof schema>>({
    name: 'shikimori-last-seen',
    async fetch() {
        const res = await fetch(ENDPOINT, {
            headers: {
                'User-Agent': 'tei.su/1.0',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch shikimori last seen: ${res.status} ${await res.text()}`)
        }

        const data = await zodValidate(z.array(schema), await res.json())

        return data[0]
    },
    expiresIn: () => TTL,
    lazy: true,
    swr: true,
    swrValidator: (_data, time) => Date.now() - time < STALE_TTL,
})

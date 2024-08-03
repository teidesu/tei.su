import { z } from 'zod'

import { Reloadable } from '~/backend/utils/reloadable'
import { zodValidate } from '~/utils/zod'

const ENDPOINT = 'https://api.github.com/users/teidesu/events/public?per_page=1'
const TTL = 1 * 60 * 60 * 1000 // 1 hour
const STALE_TTL = 4 * 60 * 60 * 1000 // 4 hours

const schema = z.object({
    id: z.string(),
    type: z.string(),
    payload: z.any(),
    repo: z.object({ name: z.string(), url: z.string() }),
    public: z.boolean(),
    created_at: z.string(),
})

export const githubLastSeen = new Reloadable<z.infer<typeof schema>>({
    name: 'github-last-seen',
    async fetch() {
        const res = await fetch(ENDPOINT, {
            headers: {
                'User-Agent': 'tei.su/1.0',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch github last seen: ${res.status} ${await res.text()}`)
        }

        const data = await zodValidate(z.array(schema), await res.json())

        return data[0]
    },
    expiresIn: () => TTL,
    lazy: true,
    swr: true,
    swrValidator: (_data, time) => Date.now() - time < STALE_TTL,
})

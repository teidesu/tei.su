import { AsyncResource } from '@fuman/utils'
import { z } from 'zod'

import { ffetch } from '../../utils/fetch.ts'

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

export const shikimoriLastSeen = new AsyncResource<z.infer<typeof schema>>({
    async fetcher() {
        const res = await ffetch(ENDPOINT).parsedJson(z.array(schema))

        return {
            data: res[0],
            expiresIn: TTL,
        }
    },
    swr: true,
    swrValidator: ({ currentFetchedAt }) => Date.now() - currentFetchedAt < STALE_TTL,
})

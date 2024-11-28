import { AsyncResource } from '@fuman/utils'
import { z } from 'zod'

import { ffetch } from '../../utils/fetch.ts'

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

export const githubLastSeen = new AsyncResource<z.infer<typeof schema>>({
    async fetcher() {
        const res = await ffetch(ENDPOINT, {
            headers: {
                'User-Agent': 'tei.su/1.0',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        }).parsedJson(z.array(schema))

        return {
            data: res[0],
            expiresIn: TTL,
        }
    },
    swr: true,
    swrValidator: ({ currentFetchedAt }) => Date.now() - currentFetchedAt < STALE_TTL,
})

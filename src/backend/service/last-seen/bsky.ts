import { AsyncResource } from '@fuman/utils'
import { z } from 'zod'

import { ffetch } from '../../utils/fetch.ts'

const ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed'
const TTL = 3 * 60 * 60 * 1000 // 3 hours
const STALE_TTL = 8 * 60 * 60 * 1000 // 8 hours

const schema = z.object({
    uri: z.string(),
    record: z.object({
        text: z.string(),
        createdAt: z.string(),
    }),
})

export const bskyLastSeen = new AsyncResource<z.infer<typeof schema>>({
    async fetcher() {
        const res = await ffetch(ENDPOINT, {
            query: {
                actor: 'did:web:tei.su',
                filter: 'posts_and_author_threads',
                limit: 1,
            },
        }).parsedJson(z.object({
            feed: z.array(z.object({
                post: schema,
            })),
        }))

        return {
            data: res.feed[0].post,
            expiresIn: TTL,
        }
    },
    swr: true,
    swrValidator: ({ currentFetchedAt }) => Date.now() - currentFetchedAt < STALE_TTL,
})

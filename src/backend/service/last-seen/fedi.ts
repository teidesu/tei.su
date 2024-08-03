import { z } from 'zod'

import { Reloadable } from '~/backend/utils/reloadable'
import { zodValidate } from '~/utils/zod'

const ENDPOINT = 'https://very.stupid.fish/api/users/notes'
const TTL = 3 * 60 * 60 * 1000 // 3 hours
const STALE_TTL = 8 * 60 * 60 * 1000 // 8 hours
const BODY = {
    userId: '9o5tqc3ok6pf5hjx',
    withRenotes: false,
    withReplies: false,
    withChannelNotes: false,
    withFiles: false,
    limit: 1,
    allowPartial: true,
}

const schema = z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    text: z.nullable(z.string()),
})

export const fediLastSeen = new Reloadable<z.infer<typeof schema>>({
    name: 'fedi-last-seen',
    async fetch() {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(BODY),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch fedi last seen: ${res.status} ${await res.text()}`)
        }

        const data = await zodValidate(z.array(schema), await res.json())

        return data[0]
    },
    expiresIn: () => TTL,
    lazy: true,
    swr: true,
    swrValidator: (_data, time) => Date.now() - time < STALE_TTL,
})

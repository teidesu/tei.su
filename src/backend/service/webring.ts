import { z } from 'zod'

import { Reloadable } from '~/backend/utils/reloadable'
import { zodValidate } from '~/utils/zod'

const WEBRING_URL = 'https://otomir23.me/webring/5/data'
const WEBRING_TTL = 1000 * 60 * 60 * 24 // 24 hours

const WebringItem = z.object({
    id: z.number(),
    name: z.string(),
    url: z.string(),
})
export type WebringItem = z.infer<typeof WebringItem>

const WebringData = z.object({
    prev: WebringItem,
    next: WebringItem,
})
export type WebringData = z.infer<typeof WebringData>

export const webring = new Reloadable({
    name: 'webring',
    fetch: async () => {
        const response = await fetch(WEBRING_URL)
        if (!response.ok) {
            const text = await response.text()
            throw new Error(`Failed to fetch webring data: ${response.status} ${text}`)
        }

        const data = await response.json()
        const parsed = await zodValidate(WebringData, data)

        return parsed
    },
    expiresIn: () => WEBRING_TTL,
    lazy: true,
    swr: true,
})

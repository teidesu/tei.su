import { AsyncResource } from '@fuman/utils'
import { z } from 'zod'

import { ffetch } from '../utils/fetch.ts'

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

export const webring = new AsyncResource<WebringData>({
    fetcher: async () => {
        const res = await ffetch(WEBRING_URL).parsedJson(WebringData)

        return {
            data: res,
            expiresIn: WEBRING_TTL,
        }
    },
    swr: true,
})

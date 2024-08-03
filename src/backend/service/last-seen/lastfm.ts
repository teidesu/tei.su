import { z } from 'zod'

import { Reloadable } from '~/backend/utils/reloadable'
import { zodValidate } from '~/utils/zod'
import { env } from '~/backend/env'

const LASTFM_TTL = 1000 * 60 * 5 // 5 minutes
const LASTFM_STALE_TTL = 1000 * 60 * 60 // 1 hour
const LASTFM_USERNAME = 'teidesu'
const LASTFM_TOKEN = env.LASTFM_TOKEN

const LastfmTrack = z.object({
    'artist': z.object({ 'mbid': z.string(), '#text': z.string() }),
    'name': z.string(),
    'url': z.string(),
    'date': z.object({ uts: z.string() }).optional(),
    '@attr': z.object({
        nowplaying: z.literal('true'),
    }).partial().optional(),
})
export type LastfmTrack = z.infer<typeof LastfmTrack>

const ResponseSchema = z.object({
    recenttracks: z.object({
        'track': z.array(LastfmTrack),
        '@attr': z.object({
            user: z.string(),
            totalPages: z.string(),
            page: z.string(),
            perPage: z.string(),
            total: z.string(),
        }),
    }),
})

export const lastfm = new Reloadable<LastfmTrack>({
    name: 'last-track',
    async fetch(prev) {
        const params = new URLSearchParams({
            method: 'user.getrecenttracks',
            user: LASTFM_USERNAME,
            api_key: LASTFM_TOKEN,
            format: 'json',
            limit: '1',
        })
        if (prev?.date) {
            params.set('from', prev.date!.uts)
        }
        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`)

        if (!res.ok) {
            throw new Error(`Failed to fetch last.fm data: ${res.status} ${await res.text()}`)
        }

        const data = await res.json()
        const parsed = await zodValidate(ResponseSchema, data)

        const track = parsed.recenttracks.track[0]
        if (!track.date && track['@attr']?.nowplaying) {
            track.date = { uts: Math.floor(Date.now() / 1000).toString() }
        } else if (!track.date) {
            throw new Error('no track found')
        }

        return track
    },
    expiresIn: () => LASTFM_TTL,
    lazy: true,
    swr: true,
    swrValidator: (_data, time) => Date.now() - time < LASTFM_STALE_TTL,
})

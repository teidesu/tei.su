import { assertMatches } from '@fuman/utils'

import { bskyLastSeen } from './bsky.ts'
import { githubLastSeen } from './github'
import { lastfm } from './lastfm'
import { shikimoriLastSeen } from './shikimori'

export interface LastSeenItem {
    source: string
    sourceLink: string
    time: number
    text: string
    suffix?: string
    link: string
}

export async function fetchLastSeen() {
    const [
        lastfmData,
        bskyData,
        shikimoriData,
        githubData,
    ] = await Promise.all([
        lastfm.get(),
        bskyLastSeen.get(),
        shikimoriLastSeen.get(),
        githubLastSeen.get(),
    ])

    const res: LastSeenItem[] = []

    if (lastfmData) {
        res.push({
            source: 'last.fm',
            sourceLink: 'https://last.fm/user/teidesu',
            time: Number(lastfmData.date!.uts) * 1000,
            text: `${lastfmData.name} – ${lastfmData.artist['#text']}`,
            link: lastfmData.url,
        })
    }

    if (bskyData) {
        const postId = bskyData.uri.match(/at:\/\/did:web:tei.su\/app\.bsky\.feed\.post\/([a-zA-Z0-9]+)/)
        if (postId) {
            res.push({
                source: 'bsky',
                sourceLink: 'https://bsky.app/profile/did:web:tei.su',
                time: new Date(bskyData.record.createdAt).getTime(),
                text: bskyData.record.text.slice(0, 40) || '[no text]',
                link: `https://bsky.app/profile/did:web:tei.su/post/${postId[0]}`,
            })
        }
    }

    if (shikimoriData) {
        // thx morr for this fucking awesome api

        const mapper: Record<string, string> = {
            'Просмотрено': 'completed',
            'Прочитано': 'completed',
            'Добавлено в список': 'added',
            'Брошено': 'dropped',
        }
        let event = mapper[shikimoriData.description]

        if (!event && shikimoriData.description.match(/^Просмотрен.*эпизод(ов)?$/)) {
            event = 'watched'
        }
        if (!event && shikimoriData.description.match(/^(Просмотрено|Прочитано) и оценено/)) {
            event = 'completed'
        }

        if (event) {
            res.push({
                source: 'shiki',
                sourceLink: 'https://shikimori.one/teidesu',
                time: new Date(shikimoriData.created_at).getTime(),
                text: shikimoriData.target.name,
                suffix: `: ${event}`,
                link: `https://shikimori.one${shikimoriData.target.url}`,
            })
        }
    }

    if (githubData) {
        const eventTextMapper: Record<string, () => string> = {
            CreateEvent: () => `${githubData.payload.ref_type} created`,
            DeleteEvent: () => `${githubData.payload.ref_type} deleted`,
            ForkEvent: () => 'forked',
            GollumEvent: () => 'wiki updated',
            IssueCommentEvent: () => `issue comment ${githubData.payload.action}`,
            IssuesEvent: () => `issue ${githubData.payload.action}`,
            PublicEvent: () => 'made public',
            PullRequestEvent: () => `pr ${githubData.payload.action}`,
            PushEvent: () => `pushed ${githubData.payload.distinct_size} commits`,
            ReleaseEvent: () => `release ${githubData.payload.action}`,
            WatchEvent: () => 'starred',
        }
        if (eventTextMapper[githubData.type]) {
            res.push({
                source: 'github',
                sourceLink: 'https://github.com/teidesu',
                time: new Date(githubData.created_at).getTime(),
                text: githubData.repo.name,
                suffix: `: ${eventTextMapper[githubData.type]()}`,
                link: `https://github.com/${githubData.repo.name}`,
            })
        }
    }

    return res.sort((a, b) => b.time - a.time)
}

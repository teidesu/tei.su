import { obfuscateEmail } from '~/backend/utils/obfuscate-email'
import { webring } from '~/backend/service/webring'
import { umamiFetchStats } from '~/backend/service/umami'
import { fetchLastSeen } from '~/backend/service/last-seen'

export async function fetchMainPageData() {
    const [
        pageViews,
        webringData,
        lastSeen,
    ] = await Promise.all([
        umamiFetchStats('/', 1700088965789)
            .then(stats => `${stats.visitors.value + 321487}`) // value before umami
            .catch((err) => {
                console.error('Failed to fetch page views: ', err)
                return '[error]'
            }),
        webring.get(),
        fetchLastSeen(),
    ])

    return {
        email: obfuscateEmail('alina@tei.su'),
        pageViews,
        shouts: [],
        webring: webringData,
        lastSeen,
    }
}

export type PageData = Awaited<ReturnType<typeof fetchMainPageData>>

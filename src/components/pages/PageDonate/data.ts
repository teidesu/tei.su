import { randomBytes } from 'node:crypto'

import { umamiFetchStats } from '~/backend/service/umami'

import type { PaymentMethod } from './constants'
import { PAYMENT_METHODS } from './constants'
import { deriveKey, dumbHash, xorContinuous } from './crypto-common'

export async function fetchDonatePageData(request: Request) {
    const pageViews = await umamiFetchStats('/donate', 1700088965789)
        .then(stats => `${stats.visitors.value + 9089}`) // value before umami
        .catch((err) => {
            console.error('Failed to fetch page views: ', err)
            return '[error]'
        })

    const salt = randomBytes(12).toString('base64')
    const probe = randomBytes(12).toString('base64')
    const url = new URL(request.url, `${import.meta.env.DEV ? 'http' : 'https'}://${request.headers.get('host')}`)
    const key = deriveKey(request.headers.get('user-agent') || '', url.href, salt)

    const keyHash = dumbHash(key)
    const xorPos = [0]

    const probeEnc = xorContinuous(keyHash, probe, xorPos)

    const encryptedData: PaymentMethod[] = PAYMENT_METHODS.map(it => ({
        ...it,
        link: it.link ? xorContinuous(keyHash, it.link, xorPos) : undefined,
        text: xorContinuous(keyHash, it.text, xorPos),
    }))

    return {
        encryptedData,
        probe,
        probeEnc,
        salt,
        pageViews,
    }
}

export type PageData = Awaited<ReturnType<typeof fetchDonatePageData>>

import { z } from 'zod'

import { Reloadable } from '../utils/reloadable'
import { env } from '../env'
import { zodValidate } from '../../utils/zod'

export const AVAILABLE_CURRENCIES = ['RUB', 'USD', 'EUR']
const TTL = 60 * 60 * 1000 // 1 hour

const schema = z.object({
    meta: z.object({
        last_updated_at: z.string(),
    }),
    data: z.record(z.string(), z.object({
        code: z.string(),
        value: z.number(),
    })),
})

const reloadable = new Reloadable({
    name: 'currencies',
    expiresIn: () => TTL,
    async fetch() {
        // https://api.currencyapi.com/v3/latest?apikey=cur_live_ZGgJCl3CfMM7TqXSdlUTiKlO2e81lLcOVX5mCXb6&currencies=USD%2CEUR
        // apikey=cur_live_ZGgJCl3CfMM7TqXSdlUTiKlO2e81lLcOVX5mCXb6&currencies=USD%2CEUR
        const res = await fetch(`https://api.currencyapi.com/v3/latest?${new URLSearchParams({
            apikey: env.CURRENCY_API_TOKEN,
            currencies: AVAILABLE_CURRENCIES.slice(1).join(','),
            base_currency: AVAILABLE_CURRENCIES[0],
        })}`)

        if (!res.ok) {
            throw new Error(`Failed to fetch currencies: ${res.status} ${await res.text()}`)
        }

        return zodValidate(schema, await res.json())
    },
    lazy: true,
    swr: true,
})

export function convertCurrencySync(from: string, to: string, amount: number) {
    if (from === to) return amount
    if (!AVAILABLE_CURRENCIES.includes(from)) throw new Error(`Invalid currency: ${from}`)
    if (!AVAILABLE_CURRENCIES.includes(to)) throw new Error(`Invalid currency: ${to}`)

    const data = reloadable.getCached()
    if (!data) throw new Error('currencies not available')

    if (from !== AVAILABLE_CURRENCIES[0]) {
        // convert to base currency first
        amount /= data.data[from].value
    }

    return amount * data.data[to].value
}

export async function fetchConvertRates() {
    await reloadable.get()
}

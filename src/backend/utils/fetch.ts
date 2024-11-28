import { ffetchAddons, ffetchBase } from '@fuman/fetch'
import { ffetchZodAdapter } from '@fuman/fetch/zod'

export const ffetch = ffetchBase.extend({
    addons: [
        ffetchAddons.parser(ffetchZodAdapter()),
        ffetchAddons.retry(),
    ],
    headers: {
        'User-Agent': 'tei.su/1.0',
    },
})

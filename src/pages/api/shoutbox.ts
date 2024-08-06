import type { APIRoute } from 'astro'
import { z } from 'zod'
import { fromError } from 'zod-validation-error'
import { RateLimiterMemory } from 'rate-limiter-flexible'

import { createShout, fetchShouts } from '~/backend/service/shoutbox'
import { getRequestIp } from '~/backend/utils/request'
import { verifyCsrfToken } from '~/backend/utils/csrf'
import { HttpResponse } from '~/backend/utils/response'

const schema = z.object({
    _csrf: z.string(),
    message: z.string(),
    private: z.literal('').optional(),
})

const rateLimitPerIp = new RateLimiterMemory({ points: 3, duration: 300 })
const rateLimitGlobal = new RateLimiterMemory({ points: 100, duration: 3600 })

export const POST: APIRoute = async (ctx) => {
    const contentType = ctx.request.headers.get('content-type')
    const isFormSubmit = contentType === 'application/x-www-form-urlencoded'

    let bodyRaw: unknown
    if (isFormSubmit) {
        bodyRaw = Object.fromEntries((await ctx.request.formData()).entries())
    } else {
        bodyRaw = await ctx.request.json()
    }

    const body = await schema.safeParseAsync(bodyRaw)
    if (body.error) {
        return HttpResponse.json({
            error: fromError(body.error).message,
        }, { status: 400 })
    }

    const ip = getRequestIp(ctx)

    if (!verifyCsrfToken(ip, body.data._csrf)) {
        return HttpResponse.json({
            error: 'csrf token is invalid',
        }, { status: 400 })
    }

    const remainingLocal = await rateLimitPerIp.get(ip)
    const remainingGlobal = await rateLimitGlobal.get('GLOBAL')
    if (remainingLocal?.remainingPoints === 0) {
        return HttpResponse.json({
            error: 'too many requests',
        }, { status: 400 })
    }
    if (remainingGlobal?.remainingPoints === 0) {
        return HttpResponse.json({
            error: `too many requests (globally), please retry after ${Math.ceil(remainingGlobal.msBeforeNext) / 60_000} minutes`,
        }, { status: 400 })
    }

    const result = await createShout({
        fromIp: ip,
        private: body.data.private === '',
        text: body.data.message,
    })

    await rateLimitPerIp.penalty(ip, 1)
    await rateLimitGlobal.penalty('GLOBAL', 1)

    if (isFormSubmit) {
        return HttpResponse.redirect(typeof result === 'string' ? `/?shout_error=${result}` : '/')
    }

    return HttpResponse.json(
        typeof result === 'string' ? { error: result } : { ok: true },
    )
}

export const GET: APIRoute = async (ctx) => {
    const url = new URL(ctx.request.url)

    let page = Number(url.searchParams.get('page'))
    if (Number.isNaN(page)) page = 0

    const data = fetchShouts(page, getRequestIp(ctx))

    return HttpResponse.json(data)
}

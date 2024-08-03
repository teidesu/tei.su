import type { APIRoute } from 'astro'
import { z } from 'zod'
import { fromError } from 'zod-validation-error'

import { createShout, fetchShouts } from '~/backend/service/shoutbox'
import { getRequestIp } from '~/backend/utils/request'
import { verifyCsrfToken } from '~/backend/utils/csrf'

const schema = z.object({
    _csrf: z.string(),
    message: z.string(),
    private: z.literal('').optional(),
})

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
        return new Response(JSON.stringify({
            error: fromError(body.error).message,
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    const ip = getRequestIp(ctx)

    if (!verifyCsrfToken(ip, body.data._csrf)) {
        return new Response(JSON.stringify({
            error: 'csrf token is invalid',
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    const result = await createShout({
        fromIp: ip,
        private: body.data.private === '',
        text: body.data.message,
    })

    if (isFormSubmit) {
        return new Response(null, {
            status: 301,
            headers: {
                Location: typeof result === 'string' ? `/?shout_error=${result}` : '/',
            },
        })
    }

    return new Response(JSON.stringify(
        typeof result === 'string' ? { error: result } : { ok: true },
    ), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

export const GET: APIRoute = async (ctx) => {
    const url = new URL(ctx.request.url)

    let page = Number(url.searchParams.get('page'))
    if (Number.isNaN(page)) page = 0

    const data = fetchShouts(page, getRequestIp(ctx))

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

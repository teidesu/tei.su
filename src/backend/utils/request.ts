import type { APIContext, AstroGlobal } from 'astro'

export function getRequestIp(ctx: AstroGlobal | APIContext) {
    const xForwardedFor = ctx.request.headers.get('x-forwarded-for')
    if (xForwardedFor) return xForwardedFor.split(',')[0]

    return ctx.clientAddress
}

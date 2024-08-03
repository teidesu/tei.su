import type { APIContext, AstroGlobal } from 'astro'

export function getRequestIp(ctx: AstroGlobal | APIContext) {
    return ctx.request.headers.get('x-forwarded-for') ?? ctx.clientAddress
}

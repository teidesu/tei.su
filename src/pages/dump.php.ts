import type { APIRoute } from 'astro'

export const GET: APIRoute = ctx => new Response(
    JSON.stringify(
        Object.fromEntries(new URL(ctx.request.url).searchParams.entries()),
    ),
    {
        headers: {
            'Content-Type': 'application/json',
        },
    },
)

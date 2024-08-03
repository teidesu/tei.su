import type { APIRoute } from 'astro'

export const GET: APIRoute = () => new Response(null, {
    status: 301,
    headers: {
        Location: 'https://teidesu.github.io/protoflex/repl',
    },
})

// include_once(dirname(__FILE__) . "/_secure/umami.php");

import type { APIRoute } from 'astro'

import { umamiLogThisVisit } from '../backend/service/umami'

const EMPTY_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64')
export const GET: APIRoute = async (ctx) => {
    const website = new URL(ctx.request.url).searchParams.get('website')
    if (!website) {
        return new Response('no website', {
            status: 400,
        })
    }

    umamiLogThisVisit(
        ctx.request,
        ctx.request.headers.get('origin') ?? ctx.request.headers.get('referer') ?? undefined,
        website,
    )

    return new Response(EMPTY_GIF, {
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
        },
    })
}

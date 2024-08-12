import type { APIRoute } from 'astro'

import { randomPick } from '~/utils/random'

export const GET: APIRoute = () => new Response(`${randomPick([
    'mrrrp meow!',
    'meowwww~',
    'mrrrrrrrrp',
    'purrrrrrrrrrrrrr',
    'meow :3',
    'miew  >_<',
    'try BARKing instead',
])}\n`)

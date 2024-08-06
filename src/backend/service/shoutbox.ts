import { BotKeyboard, html } from '@mtcute/node'
import { and, desc, eq, gt, not, or, sql } from 'drizzle-orm'

import { ShoutboxAction } from '../bot/shoutbox.js'
import { shouts, shoutsBans } from '../models/index.js'
import { URL_REGEX } from '../utils/url.js'
import { db } from '../db'
import { env } from '../env'
import { tg } from '../bot'

const SHOUTS_PER_PAGE = 5

const filter = or(
    not(shouts.pending),
    and(shouts.pending, eq(shouts.fromIp, sql.placeholder('fromIp'))),
)

const fetchTotal = db.select({
    count: sql<number>`count(1)`,
}).from(shouts)
    .where(filter)
    .prepare()

const fetchList = db.select({
    createdAt: shouts.createdAt,
    text: shouts.text,
    pending: shouts.pending,
    serial: shouts.serial,
}).from(shouts)
    .where(filter)
    .limit(SHOUTS_PER_PAGE)
    .orderBy(desc(shouts.createdAt))
    .offset(sql.placeholder('offset'))
    .prepare()

export function fetchShouts(page: number, ip: string) {
    return {
        items: fetchList.all({
            offset: page * SHOUTS_PER_PAGE,
            fromIp: ip,
        }),
        pageCount: Math.ceil((fetchTotal.get({
            fromIp: ip,
        })?.count ?? 0) / SHOUTS_PER_PAGE),
    }
}
export type ShoutsData = ReturnType<typeof fetchShouts>

const fetchNextSerial = db.select({
    serial: sql<number>`coalesce(max(serial), 0) + 1`,
}).from(shouts)
    .prepare()

export function approveShout(id: string) {
    const nextSerial = fetchNextSerial.get({})!.serial

    db.update(shouts)
        .set({ pending: false, serial: nextSerial })
        .where(eq(shouts.id, id))
        .run()
}

export function declineShout(id: string) {
    db.delete(shouts)
        .where(eq(shouts.id, id))
        .run()
}

export function deleteBySerial(serial: number) {
    db.delete(shouts)
        .where(eq(shouts.serial, serial))
        .run()
        // adjust serials
    db.update(shouts)
        .set({ serial: sql<number>`serial - 1` })
        .where(and(
            eq(shouts.pending, false),
            gt(shouts.serial, sql.placeholder('serial')),
        ))
        .run({ serial })
}

export function banShouts(ip: string, expires: number) {
    db.insert(shoutsBans)
        .values({
            ip,
            expires,
        })
        .onConflictDoUpdate({
            target: shoutsBans.ip,
            set: { expires },
        })
        .execute()
}

export function unbanShouts(ip: string) {
    db.delete(shoutsBans)
        .where(eq(shoutsBans.ip, ip))
        .execute()
}

export function isShoutboxBanned(ip: string): Date | null {
    const ban = db.select()
        .from(shoutsBans)
        .where(eq(shoutsBans.ip, ip))
        .get()
    if (!ban) return null

    const expires = ban.expires
    if (Date.now() > expires) return null
    return new Date(ban.expires)
}

function validateShout(text: string, isPublic: boolean) {
    if (text.length < 3) {
        return 'too short, come on'
    }

    if (text.length > 300) {
        return 'please keep it under 300 characters'
    }

    if (isPublic) {
        const lineCount = text.split('\n').length
        if (lineCount > 5) {
            return 'too many lines, keep it under 5'
        }

        if (URL_REGEX.test(text)) {
            return 'no links plz'
        }
    }

    return true
}

export async function createShout(params: {
    fromIp: string
    private: boolean
    text: string
}): Promise<boolean | string> {
    let { text } = params

    text = text.trim()

    const validateResult = validateShout(text, !params.private)

    const kindText = params.private ? 'private message' : 'shout'

    if (params.private || validateResult !== true) {
        const was = params.private ? '' : ` was auto-declined (${validateResult})`
        await tg.sendText(
            env.TG_CHAT_ID,
            html`
                ${kindText} from <code>${params.fromIp}</code>${was}:
                <br><br>
                ${text}
            `,
        )
    }

    if (!params.private && validateResult === true) {
        const result = await db.insert(shouts)
            .values(params)
            .returning({ id: shouts.id })
            .execute()
        const id = result[0].id

        await tg.sendText(
            env.TG_CHAT_ID,
            html`
                ${kindText} from <code>${params.fromIp}</code>:
                <br><br>
                ${text}
            `,
            {
                replyMarkup: BotKeyboard.inline([[
                    BotKeyboard.callback('✅ approve', ShoutboxAction.build({ id, action: 'approve' })),
                    BotKeyboard.callback('❌ decline', ShoutboxAction.build({ id, action: 'decline' })),
                ]]),
            },
        )
    }

    return validateResult
}

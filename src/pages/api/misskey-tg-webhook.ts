import type { APIRoute } from 'astro'
import { html } from '@mtcute/node'

import { MisskeyWebhookBodySchema, type MkNote, type MkUser } from '~/backend/domain/misskey'
import { env } from '~/backend/env'
import { zodValidate } from '~/utils/zod'
import { telegramNotify } from '~/backend/bot/notify'

function misskeyMentionUser(user: MkUser, server: string): string {
    const fullUsername = user.host ? `@${user.username}@${user.host}` : `@${user.username}`

    if (user.name) {
        return `<a href="${server}/${fullUsername}">${user.name}</a>`
    }

    return `<a href="${server}/${fullUsername}">${fullUsername}</a>`
}

function misskeyNoteBrief(note: MkNote): string {
    let text = note.text || '<i>&lt;no text&gt;</i>'

    if (text.length > 100) {
        text = `${text.substring(0, 100)}...`
    }

    if (note.cw) {
        text = `CW: ${note.cw}\n\n${text}`
    }

    return text
}

function misskeyNoteLink(note: MkNote, server: string, text: string): string {
    return `<a href="${server}/notes/${note.id}">${text}</a>`
}

export const POST: APIRoute = async (ctx) => {
    if (ctx.request.headers.get('x-misskey-hook-secret') !== env.MK_WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 })
    }

    const parsed = await zodValidate(MisskeyWebhookBodySchema, await ctx.request.json())

    if (!parsed.body.notification) {
        return new Response('OK')
    }

    const notification = parsed.body.notification
    const server = parsed.server

    let text
    switch (notification.type) {
        case 'note':
        case 'mention':
        case 'reply':
        case 'renote':
        case 'quote':
            if (notification.note) {
                text = `${misskeyNoteLink(notification.note!, server, `new ${notification.type}`)} from ${misskeyMentionUser(notification.note.user!, server)}:\n\n${misskeyNoteBrief(notification.note)}`
            }
            break
        case 'follow':
        case 'unfollow':
            text = `${misskeyMentionUser(notification.user!, server)} ${notification.type}ed you`
            break
        case 'receiveFollowRequest':
            text = `${misskeyMentionUser(notification.user!, server)} sent you a follow request`
            break
        case 'followRequestAccepted':
            text = `${misskeyMentionUser(notification.user!, server)} accepted your follow request`
            break
        case 'reaction':
            if (notification.note) {
                text = `${misskeyNoteLink(notification.note!, server, 'note')} received ${notification.reaction} reaction from ${misskeyMentionUser(notification.user!, server)}:\n\n${misskeyNoteBrief(notification.note)}`
            }
            break
        case 'edited':
            if (notification.note) {
                text = `${misskeyNoteLink(notification.note!, server, 'a note')} was edited by ${misskeyMentionUser(notification.user!, server)}:\n\n${misskeyNoteBrief(notification.note)}`
            }
            break
    }

    if (text) {
        telegramNotify(html(text.replace(/\n/g, '<br/>')))
    }

    return new Response('OK')
}

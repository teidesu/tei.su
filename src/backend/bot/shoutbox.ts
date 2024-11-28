import { CallbackDataBuilder, Dispatcher, filters } from '@mtcute/dispatcher'
import { html } from '@mtcute/node'
import parseDuration from 'parse-duration'

import { env } from '../env'
import {
    answerBySerial,
    approveShout,
    banShouts,
    declineShout,
    deleteBySerial,
    unbanShouts,
} from '../service/shoutbox'

export const ShoutboxAction = new CallbackDataBuilder('shoutbox', 'id', 'action')

const dp = Dispatcher.child()

dp.onCallbackQuery(ShoutboxAction.filter({ action: 'approve' }), async (ctx) => {
    if (ctx.chat.id !== env.TG_CHAT_ID) return

    const serial = approveShout(ctx.match.id)
    await ctx.editMessageWith(msg => ({
        text: html`${msg.textWithEntities}<br><br>✅ Approved! ID: <code>${serial}</code>`,
    }))
})

dp.onCallbackQuery(ShoutboxAction.filter({ action: 'decline' }), async (ctx) => {
    if (ctx.chat.id !== env.TG_CHAT_ID) return

    declineShout(ctx.match.id)

    await ctx.editMessageWith(msg => ({
        text: html`${msg.textWithEntities}<br><br>❌ Declined!`,
    }))
})

dp.onNewMessage(filters.and(filters.chatId(env.TG_CHAT_ID), filters.command('shoutbox_del')), async (ctx) => {
    const serial = Number(ctx.command[1])
    if (Number.isNaN(serial)) {
        await ctx.answerText('invalid serial')
        return
    }

    deleteBySerial(serial)
    await ctx.answerText('deleted')
})

dp.onNewMessage(filters.and(filters.chatId(env.TG_CHAT_ID), filters.command('shoutbox_ban')), async (ctx) => {
    const ip = ctx.command[1]
    const duration = parseDuration(ctx.command[2])

    if (!duration) {
        await ctx.answerText('invalid duration')
        return
    }

    const until = Date.now() + duration

    banShouts(ip, until)
    await ctx.answerText(`banned ${ip} until ${new Date(until).toISOString()}`)
})

dp.onNewMessage(filters.and(filters.chatId(env.TG_CHAT_ID), filters.command('shoutbox_unban')), async (ctx) => {
    const ip = ctx.command[1]

    unbanShouts(ip)
    await ctx.answerText('done')
})

dp.onNewMessage(filters.and(filters.chatId(env.TG_CHAT_ID), filters.command('shoutbox_reply')), async (ctx) => {
    const serial = Number(ctx.command[1])
    if (Number.isNaN(serial)) {
        await ctx.answerText('invalid serial')
        return
    }

    answerBySerial(serial, ctx.command[2])
    await ctx.answerText('done')
})

export { dp as shoutboxDp }

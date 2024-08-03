import { CallbackDataBuilder, Dispatcher, filters } from '@mtcute/dispatcher'
import { html } from '@mtcute/node'

import { env } from '../env'
import { approveShout, declineShout, deleteBySerial } from '../service/shoutbox'

export const ShoutboxAction = new CallbackDataBuilder('shoutbox', 'id', 'action')

const dp = Dispatcher.child()

dp.onCallbackQuery(ShoutboxAction.filter({ action: 'approve' }), async (ctx) => {
    if (ctx.chat.id !== env.TG_CHAT_ID) return

    approveShout(ctx.match.id)
    await ctx.editMessageWith(msg => ({
        text: html`${msg.textWithEntities}<br><br>✅ Approved!`,
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

export { dp as shoutboxDp }

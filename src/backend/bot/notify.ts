import type { InputText, TelegramClient } from '@mtcute/node'

import { tg } from '~/backend/bot'
import { env } from '~/backend/env'

export function telegramNotify(text: InputText, options?: Parameters<TelegramClient['sendText']>[2]): void {
    tg.sendText(env.TG_CHAT_ID, text, {
        disableWebPreview: true,
        ...options,
    }).catch(console.error)
}

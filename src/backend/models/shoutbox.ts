import { randomUUID } from 'node:crypto'

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const shouts = sqliteTable('shouts', {
    id: text('id').primaryKey().$defaultFn(randomUUID),
    serial: integer('serial').notNull().default(0),
    fromIp: text('from_ip'),
    pending: integer('pending', { mode: 'boolean' }).notNull().default(true),
    text: text('text'),
    createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const shoutsBans = sqliteTable('shouts_bans', {
    ip: text('ip').primaryKey(),
    expires: integer('expires').notNull(),
})

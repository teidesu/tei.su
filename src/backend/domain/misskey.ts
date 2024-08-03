import { z } from 'zod'

const UserSchema = z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    host: z
        .string()
        .describe('The local host is represented with `null`.')
        .optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
    avatarBlurhash: z.string().optional().nullable(),
    avatarDecorations: z
        .array(
            z.object({
                id: z.string().optional().nullable(),
                angle: z.number().optional().nullable(),
                flipH: z.boolean().optional().nullable(),
                url: z.string().optional().nullable(),
                offsetX: z.number().optional().nullable(),
                offsetY: z.number().optional().nullable(),
            }),
        )
        .optional().nullable(),
    isAdmin: z.boolean().optional().nullable(),
    isModerator: z.boolean().optional().nullable(),
    isSilenced: z.boolean().optional().nullable(),
    noindex: z.boolean().optional().nullable(),
    isBot: z.boolean().optional().nullable(),
    isCat: z.boolean().optional().nullable(),
    speakAsCat: z.boolean().optional().nullable(),
    instance: z
        .object({
            name: z.string().optional().nullable(),
            softwareName: z.string().optional().nullable(),
            softwareVersion: z.string().optional().nullable(),
            iconUrl: z.string().optional().nullable(),
            faviconUrl: z.string().optional().nullable(),
            themeColor: z.string().optional().nullable(),
        })
        .optional().nullable(),
    emojis: z.record(z.string()).optional().nullable(),
    onlineStatus: z.enum(['unknown', 'online', 'active', 'offline']).optional().nullable(),
    badgeRoles: z
        .array(
            z.object({
                name: z.string().optional().nullable(),
                iconUrl: z.string().optional().nullable(),
                displayOrder: z.number().optional().nullable(),
            }),
        )
        .optional().nullable(),
})
export type MkUser = z.infer<typeof UserSchema>

const NoteSchema = z.object({
    id: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    deletedAt: z.string().optional().nullable(),
    text: z.string().optional().nullable(),
    cw: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    user: z
        .object({})
        .catchall(z.any())
        .optional().nullable(),
    replyId: z.string().optional().nullable(),
    renoteId: z.string().optional().nullable(),
    reply: z
        .object({})
        .catchall(z.any())
        .optional().nullable(),
    renote: z
        .object({})
        .catchall(z.any())
        .optional().nullable(),
    isHidden: z.boolean().optional().nullable(),
    visibility: z.enum(['public', 'home', 'followers', 'specified']).optional().nullable(),
    mentions: z.array(z.string()).optional().nullable(),
    visibleUserIds: z.array(z.string()).optional().nullable(),
    fileIds: z.array(z.string()).optional().nullable(),
    files: z.array(z.object({}).catchall(z.any())).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    poll: z
        .object({
            expiresAt: z.string().optional().nullable(),
            multiple: z.boolean().optional().nullable(),
            choices: z
                .array(
                    z.object({
                        isVoted: z.boolean().optional().nullable(),
                        text: z.string().optional().nullable(),
                        votes: z.number().optional().nullable(),
                    }),
                )
                .optional().nullable(),
        })
        .optional().nullable(),
    emojis: z.record(z.string(), z.any()).optional().nullable(),
    channelId: z.string().optional().nullable(),
    channel: z
        .object({
            id: z.string().optional().nullable(),
            name: z.string().optional().nullable(),
            color: z.string().optional().nullable(),
            isSensitive: z.boolean().optional().nullable(),
            allowRenoteToExternal: z.boolean().optional().nullable(),
            userId: z.string().optional().nullable(),
        })
        .optional().nullable(),
    localOnly: z.boolean().optional().nullable(),
    reactionAcceptance: z.string().optional().nullable(),
    reactionEmojis: z.record(z.string(), z.string()).optional().nullable(),
    reactions: z.record(z.string(), z.number()).optional().nullable(),
    renoteCount: z.number().optional().nullable(),
    repliesCount: z.number().optional().nullable(),
    uri: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    reactionAndUserPairCache: z.array(z.string()).optional().nullable(),
    clippedCount: z.number().optional().nullable(),
    myReaction: z.string().optional().nullable(),
})
export type MkNote = z.infer<typeof NoteSchema>

const NotificationSchema = z.union([
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('note').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('mention').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('reply').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('renote').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('quote').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('reaction').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
        reaction: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('pollEnded').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.union([z.literal('follow'), z.literal('unfollow')]).optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('receiveFollowRequest').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('followRequestAccepted').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('roleAssigned').optional().nullable(),
        role: z.record(z.any()).optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('achievementEarned').optional().nullable(),
        achievement: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('app').optional().nullable(),
        body: z.string().optional().nullable(),
        header: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
    }),
    z.object({
        id: z.string().optional().nullable(),
        createdAt: z.string().datetime().optional().nullable(),
        type: z.literal('edited').optional().nullable(),
        user: UserSchema.optional().nullable(),
        userId: z.string().optional().nullable(),
        note: NoteSchema.optional().nullable(),
    }),
] as const)

export const MisskeyWebhookBodySchema = z.object({
    server: z.string(),
    hookId: z.string(),
    userId: z.string(),
    eventId: z.string(),
    createdAt: z.number(),
    type: z.string(),
    body: z.object({
        notification: NotificationSchema,
    }).partial(),
})

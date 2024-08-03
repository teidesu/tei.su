export function isBotUserAgent(userAgent: string) {
    return /bot|crawl|slurp|spider|mediapartners|mastodon|akkoma|pleroma|misskey|firefish|sharkey/i.test(userAgent)
}

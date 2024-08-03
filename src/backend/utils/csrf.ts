import { createHmac, randomBytes } from 'node:crypto'

import { env } from '~/backend/env'

const secret = env.CSRF_SECRET
const validity = 300_000

export function getCsrfToken(ip: string) {
    const data = Buffer.from(JSON.stringify([Date.now(), ip]))
    const salt = randomBytes(8)
    const sign = createHmac('sha256', secret).update(data).update(salt).digest()

    return Buffer.concat([
        data,
        salt,
        sign.subarray(0, 8),
    ]).toString('base64url')
}

export function verifyCsrfToken(ip: string, token: string) {
    try {
        const buf = Buffer.from(token, 'base64url')
        if (buf.length < 16) return false

        const saltedData = buf.subarray(0, -8)
        const correctSign = createHmac('sha256', secret).update(saltedData).digest()

        if (Buffer.compare(correctSign.subarray(0, 8), buf.subarray(-8)) !== 0) {
            return false
        }

        const [issued, correctIp] = JSON.parse(buf.subarray(0, -16).toString())
        if (issued + validity < Date.now()) return false
        if (ip !== correctIp) return false

        return true
    } catch {
        return false
    }
}

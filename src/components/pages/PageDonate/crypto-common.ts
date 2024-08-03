const ascii = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function dumbHash(str: string) {
    let hash = 0
    const len = str.length
    for (let s = 0; s < len; s++) {
        hash += str.charCodeAt(s) * (s + 1) * (len - s)
    }
    hash >>>= 0

    let res = ''
    while (hash > 0) {
        const q = hash % ascii.length
        hash = ~~(hash / ascii.length)
        res += ascii[q]
    }

    return res
}

export function deriveKey(userAgent: string, href: string, salt: string) {
    return userAgent.trim() + href.replace(/#.*$/, '') + Math.floor(Date.now() / 100000) + salt
}

export function xorContinuous(key: string, str: string, posRef: number[]) {
    let pos = posRef[0]
    let ret = ''
    for (let s = 0; s < str.length; s++) {
        ret += String.fromCharCode(str.charCodeAt(s) ^ key.charCodeAt(pos))
        pos = (pos + 1) % key.length
    }
    posRef[0] = pos
    return ret
}

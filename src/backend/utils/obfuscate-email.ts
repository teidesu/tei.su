import { randomPick } from '../../utils/random'

export function obfuscateEmail(email: string) {
    const opener = randomPick(['[', '{', '(', '<', '|'])
    const closer = {
        '(': ')',
        '[': ']',
        '{': '}',
        '<': '>',
        '|': '|',
    }[opener]

    return email.replace(/@/g, ` ${opener}at${closer} `).replace(/\./g, ` ${opener}dot${closer} `)
}

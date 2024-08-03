import { randomPick } from '~/utils/random'

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; LM-Q720) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; LM-X420) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; LM-Q710(FGN)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36 Edg/103.0.1264.37',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36 Edg/103.0.1264.37',
    'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36 EdgA/100.0.1185.50',
    'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36 EdgA/100.0.1185.50',
    'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36 EdgA/100.0.1185.50',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 EdgiOS/100.1185.50 Mobile/15E148 Safari/605.1.15',
    'Mozilla/5.0 (Windows Mobile 10; Android 10.0; Microsoft; Lumia 950XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36 Edge/40.15254.603',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPod touch; CPU iPhone 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
]

const Tk = {
    ac(input: string) {
        const e = new TextEncoder().encode(input)
        let f = 0
        let a = 0
        for (f = 0; f < e.length; f++) {
            a += e[f]
            a = Tk.yc(a, '+-a^+6')
        }
        a = Tk.yc(a, '+-3^+b+-f')
        a ^= 0
        if (a < 0) { a = (a & 0x7FFFFFFF) + 0x80000000 }
        a %= 1e6
        return `${a}.${a}`
    },
    yc(a: number, b: string) {
        for (let c = 0; c < b.length - 2; c += 3) {
            const d = b[c + 2]
            const number = d >= 'a'
                // @ts-expect-error lol
                ? d - 87
                : Number.parseInt(d)
            const number2 = b[c + 1] === '+'
                ? a >>> number
                : a << number
            a = b[c] === '+'
                ? a + number2 & 0xFFFFFFFF
                : a ^ number2
        }
        return a
    },
}

async function translate(text: string, fromLanguage: string, toLanguage: string) {
    let json = null
    const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&'
        + `sl=${encodeURIComponent(fromLanguage)}&tl=${encodeURIComponent(toLanguage)}&dt=t&ie=UTF-8&`
        + 'oe=UTF-8&otf=1&ssel=0&tsel=0&kc=7&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss'
        + `&tk=${Tk.ac(text)}`
        + '&source=input'
        + `&q=${encodeURIComponent(text)}`, {
        headers: {
            'User-Agent': randomPick(USER_AGENTS),
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error('Error while requesting translation')
    }
    const content = await response.text()
    json = JSON.parse(content)

    let sourceLanguage = null
    sourceLanguage = json[2]
    let result = ''

    for (let i = 0; i < json[0]?.length; ++i) {
        const block = json[0][i][0]
        if (block == null) { continue }
        const blockText = block.toString()
        if (blockText !== 'null') { result += blockText }
    }

    return {
        sourceLanguage,
        originalText: text,
        translatedText: result,
    }
}

export async function translateChunked(text: string, fromLanguage: string, toLanguage: string) {
    let result = ''
    const chunks = text.match(/.{1,5000}/gs)!
    const promises = []

    for (let i = 0; i < chunks.length; ++i) {
        promises.push(translate(chunks[i], fromLanguage, toLanguage))
    }

    const results = await Promise.all(promises)
    for (let i = 0; i < results.length; ++i) {
        result += results[i].translatedText
    }

    return {
        sourceLanguage: results[0].sourceLanguage,
        originalText: text,
        translatedText: result,
    }
}

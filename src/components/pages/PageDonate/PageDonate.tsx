/** @jsxImportSource solid-js */
import { type JSX, createSignal, onMount } from 'solid-js'

import { Link } from '~/components/ui/Link/Link'
import { SectionTitle } from '~/components/ui/SectionTitle/SectionTitle'
import { TextTable } from '~/components/ui/TextTable/TextTable'

import type { PageData } from './data'
import type { PaymentMethod } from './constants'
import { deriveKey, dumbHash, xorContinuous } from './crypto-common'

export function PaymentMethods(props: { data: PageData }) {
    const [items, setItems] = createSignal<PaymentMethod[]>(
        // eslint-disable-next-line solid/reactivity
        props.data.encryptedData.map(it => ({
            link: undefined,
            name: it.name,
            text: '[encrypted]',
        })),
    )

    onMount(() => {
        // force client-side
        const key = deriveKey(navigator.userAgent, location.href, props.data.salt)
        const keyHash = dumbHash(key)
        const xor = [0]

        const probeDec = xorContinuous(keyHash, props.data.probeEnc, xor)
        if (probeDec !== props.data.probe) {
            console.error(`Probe mismatch (expected: ${props.data.probe}, got: ${probeDec})`)
            return
        }

        setItems(props.data.encryptedData.map(it => ({
            link: it.link ? xorContinuous(keyHash, it.link!, xor) : undefined,
            name: it.name,
            text: xorContinuous(keyHash, it.text, xor),
        })))
    })

    const itemsToRender = () => items().map(it => ({
        name: it.name,
        value: () => it.link
            ? <Link href={it.link} target="_blank">{it.text}</Link>
            : it.text,
    }))

    return (
        <TextTable
            items={itemsToRender()}
            minColumnWidth={12}
        />
    )
}

export function PageDonate(props: { methods?: JSX.Element, data: PageData }) {
    return (
        <>
            <section>heya</section>

            <section>
                i'm not really struggling with money, but if you like what i do and want to support me — i
                would totally appreciate it &lt;3
            </section>

            <section>when donating crypto, please use stablecoins (usdt/dai) or native token</section>

            <section>
                <SectionTitle>my payment addresses (in order of preference):</SectionTitle>

                {props.methods}
            </section>

            <noscript>
                <section>
                    <SectionTitle>‼️ looks like javascript is disabled.</SectionTitle>
                    that is why payment methods above aren't displayed.
                    <br />
                    to protect myself from osint and bot attacks, i do a little obfuscation.
                    <br />
                    i promise, there are no trackers here ^_^
                    <br />
                    <br />
                    if you are a weirdo using noscript or lynx or something instead of a browser, you can
                    dm me for payment details.
                </section>
            </noscript>

            <section>
                total page views so far:
                {' '}
                {props.data.pageViews}
            </section>
        </>
    )
}

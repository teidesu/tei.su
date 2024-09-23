/** @jsxImportSource solid-js */
import { For, type JSX, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { intlFormatDistance } from 'date-fns'

import { Emoji } from '~/components/ui/Emoji/Emoji'
import { SectionTitle } from '~/components/ui/SectionTitle/SectionTitle'
import { Link } from '~/components/ui/Link/Link'
import { TextComment } from '~/components/ui/TextComment/TextComment'
import { TextTable } from '~/components/ui/TextTable/TextTable'
import jsLogo from '~/assets/javascript.png'
import ukFlag from '~/assets/flag-united-kingdom_1f1ec-1f1e7.png'
import ruFlag from '~/assets/flag-russia_1f1f7-1f1fa.png'
import cherry from '~/assets/cherry-blossom_1f338.png'
import axolotl from '~/assets/axolotl.png'
import type { LastSeenItem as TLastSeenItem } from '~/backend/service/last-seen'
import { randomInt } from '~/utils/random'

import css from './PageMain.module.css'
import { SUBLINKS, TESTIMONIALS } from './constants'
import type { PageData } from './data'

function formatTimeRelative(time: number) {
    return intlFormatDistance(
        new Date(time),
        new Date(),
    )
}

function LastSeenItem(props: { first?: boolean, item: TLastSeenItem }) {
    return (
        <Dynamic component={props.first ? 'summary' : 'div'} class={css.lastSeenItem}>
            <div class={css.lastSeenLinkWrap}>
                <div class={css.lastSeenLinkWrapInner}>
                    <Link
                        class={css.lastSeenLink}
                        href={props.item.link}
                        target="_blank"
                        title={props.item.text}
                    >
                        {props.item.text}
                    </Link>
                    {props.item.suffix && (
                        <span class={css.lastSeenSuffix}>
                            {props.item.suffix}
                        </span>
                    )}
                </div>
                <i class={css.lastSeenSource}>
                    {'@ '}
                    <Link href={props.item.sourceLink} target="_blank">
                        {props.item.source}
                    </Link>
                    {', '}
                    {formatTimeRelative(props.item.time)}
                </i>
            </div>
            <Show when={props.first}>
                <div class={css.lastSeenTrigger} />
            </Show>
        </Dynamic>
    )
}

export function PageMain(props: {
    data: PageData
    partTimeWords?: JSX.Element
    shoutbox?: JSX.Element
}) {
    const testimonials = TESTIMONIALS.map((props) => {
        const link = props.href
            ? (
                    <Link href={props.href} target="_blank">
                        {props.author}
                    </Link>
                )
            : <i>{props.author}</i>

        return (
            <div class={css.testimonial}>
                "
                {props.text}
                "&nbsp;-&nbsp;
                {link}
            </div>
        )
    })

    /* eslint-disable solid/no-innerhtml */
    const sublinks = SUBLINKS.map(item => (
        <div>
            -
            {' '}
            <Link
                href={item.link}
                target="_blank"
                data-astro-prefetch={item.noPrefetch ? 'false' : undefined}
            >
                {item.title}
            </Link>
            :
            {' '}
            <span innerHTML={item.subtitle} />
            <TextComment
                class={css.comment}
                innerHTML={item.comment}
            />
        </div>
    ))
    /* eslint-enable solid/no-innerhtml */

    return (
        <>
            <section>{`h${'i'.repeat(randomInt(2, 5))}~`}</section>

            <section>
                i am
                {' '}
                <b>alina</b>
                {' '}
                aka
                {' '}
                <b>teidesu</b>
                {' '}
                🌸
                <br />
                full-time js/ts developer, part-time
                {' '}
                {props.partTimeWords}
                {' '}
                <br />
                more about me as a dev on my
                {' '}
                <Link href="//github.com/teidesu" target="_blank">
                    github page
                </Link>
            </section>

            <section>
                <SectionTitle>
                    extremely interesting info (no):
                </SectionTitle>
                <TextTable
                    items={[
                        { name: 'birthday', value: () => 'july 25 (leo ♌)' },
                        {
                            name: 'langs',
                            value: () => (
                                <>
                                    <Emoji alt="🇷🇺" src={ruFlag.src} />
                                    {' '}
                                    native,
                                    {' '}
                                    <Emoji alt="🇬🇧" src={ukFlag.src} />
                                    {' '}
                                    c1,
                                    {' '}
                                    <Emoji alt="javascript" src={jsLogo.src} />
                                    {' '}
                                    native
                                </>
                            ),
                        },
                        {
                            name: 'last seen',
                            value: () => {
                                if (!props.data.lastSeen?.length) return

                                return (
                                    <details class={css.lastSeen}>
                                        <LastSeenItem first item={props.data.lastSeen[0]} />
                                        <For each={props.data.lastSeen.slice(1)}>
                                            {it => <LastSeenItem item={it} />}
                                        </For>
                                    </details>
                                )
                            },
                        },
                        {
                            name: 'fav color',
                            value: () => (
                                <>
                                    #be15dc
                                    {' '}
                                    <div class={css.favColor} />
                                </>
                            ),
                        },
                        {
                            name: 'fav flower',
                            value: () => (
                                <>
                                    cherry blossom
                                    {' '}
                                    <Emoji alt="🌸" src={cherry.src} />
                                    , lilac
                                </>
                            ),
                        },
                        {
                            name: 'fav animal',
                            value: () => (
                                <>
                                    axolotl
                                    {' '}
                                    <Emoji alt="axolotl" src={axolotl.src} />
                                </>
                            ),
                        },
                        {
                            name: 'fav anime',
                            value: () => (
                                <>
                                    nichijou (
                                    <Link href="//shikimori.one/animes/10165-nichijou" target="_blank">
                                        shiki
                                    </Link>
                                    /
                                    <Link href="//anilist.co/anime/10165/Nichijou" target="_blank">
                                        anilist
                                    </Link>
                                    )
                                </>
                            ),
                        },
                        {
                            name: 'fav music',
                            value: () => (
                                <>
                                    hyperpop, digicore, happy hardcore
                                </>
                            ),
                        },
                    ]}
                    wrap
                    fill
                />
            </section>
            <section>
                <SectionTitle>
                    contact me (in order of preference):
                </SectionTitle>
                <TextTable
                    items={[
                        {
                            name: 'telegram',
                            value: () => (
                                <Link href="//t.me/teidumb" target="_blank">
                                    @teidumb
                                </Link>
                            ),
                        },
                        {
                            name: 'fedi',
                            value: () => (
                                <Link href="https://very.stupid.fish/@teidesu" target="_blank">
                                    @teidesu@very.stupid.fish
                                </Link>
                            ),
                        },
                        {
                            name: 'matrix',
                            value: () => (
                                <Link href="//matrix.to/#/@teidesu:stupid.fish" target="_blank">
                                    @teidesu:stupid.fish
                                </Link>
                            ),
                        },
                        {
                            name: 'email',
                            value: () => props.data.email,
                        },
                        {
                            name: 'phone',
                            value: () => 'secret :p',
                        },
                        {
                            name: 'post pigeons',
                            value: () => 'please don\'t',
                        },
                    ]}
                    wrap
                />
            </section>

            <section>
                <SectionTitle>
                    testimonials from THEM:
                </SectionTitle>

                {testimonials}

                <TextComment class={css.commentInline}>
                    feel free to leave yours :3
                </TextComment>
            </section>

            {props.shoutbox}

            <section>
                <SectionTitle>
                    top secret sub-pages:
                </SectionTitle>

                {sublinks}
            </section>

            <section>
                total page views so far:
                {' '}
                {props.data.pageViews}
            </section>

            <Show when={props.data.webring}>
                <section class={css.webring}>
                    <Link href={props.data.webring!.prev.url}>
                        &lt;
                        {' '}
                        {props.data.webring!.prev.name}
                    </Link>
                    <Link href="https://otomir23.me/webring" target="_blank">
                        rutg webring
                    </Link>
                    <Link href={props.data.webring!.next.url}>
                        {props.data.webring!.next.name}
                        {' '}
                        &gt;
                    </Link>
                </section>
            </Show>
        </>
    )
}

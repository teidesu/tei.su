/* eslint-disable no-alert */
/** @jsxImportSource solid-js */
import { type ComponentProps, Show, createSignal, onMount } from 'solid-js'
import { QueryClient, QueryClientProvider, createQuery, keepPreviousData } from '@tanstack/solid-query'
import { format } from 'date-fns/format'

import { Button } from '~/components/ui/Button/Button'
import { Checkbox } from '~/components/ui/Checkbox/Checkbox'
import { GravityClock } from '~/components/ui/Icons/glyphs/GravityClock'
import { GravityMegaphone } from '~/components/ui/Icons/glyphs/GravityMegaphone'
import { Icon } from '~/components/ui/Icons/Icon'
import { SectionTitle } from '~/components/ui/SectionTitle/SectionTitle'
import { TextArea } from '~/components/ui/TextArea/TextArea'
import { TextComment } from '~/components/ui/TextComment/TextComment'
import type { ShoutsData } from '~/backend/service/shoutbox'
import pageCss from '../PageMain.module.css'

import css from './Shoutbox.module.css'

async function fetchShouts(page: number): Promise<ShoutsData> {
    return fetch(`/api/shoutbox?page=${page}`).then(r => r.json())
}

function ShoutboxInner(props: {
    initPage: number
    initPageData: ShoutsData
    shoutError?: string
    csrf: string
}) {
    // eslint-disable-next-line solid/reactivity
    const [page, setPage] = createSignal(props.initPage)
    // eslint-disable-next-line solid/reactivity
    const [initData, setInitData] = createSignal<ShoutsData | undefined>(props.initPageData)

    const shouts = createQuery(() => ({
        queryKey: ['shouts', page()],
        queryFn: () => fetchShouts(page()),
        cacheTime: 0,
        gcTime: 0,
        refetchInterval: 30000,
        placeholderData: keepPreviousData,
        initialData: initData,
    }))
    const [sending, setSending] = createSignal(false)
    const [jsEnabled, setJsEnabled] = createSignal(false)
    onMount(() => setJsEnabled(true))

    const onPageClick = (next: boolean) => (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setInitData(undefined)

        const newPage = next ? page() + 1 : page() - 1

        const link = e.currentTarget as HTMLAnchorElement
        const href = link.href

        history.replaceState(null, '', href)
        setPage(newPage)
    }

    const shoutsRender = () => shouts.data?.items.map((props) => {
        const icon = props.pending
            ? (
                    <Icon
                        glyph={GravityClock}
                        size={16}
                        title="awaiting moderation"
                    />
                )
            : `#${props.serial}`

        return (
            <div class={css.shout}>
                <div class={css.header}>
                    {icon}
                    <time class={css.time} datetime={props.createdAt}>
                        {format(props.createdAt, 'yyyy-MM-dd HH:mm')}
                    </time>
                </div>
                <div class={css.text}>
                    {props.text}
                    {props.reply && (
                        <div class={css.reply}>
                            <b>reply: </b>
                            {props.reply}
                        </div>
                    )}
                </div>
            </div>
        )
    })

    let privateCheckbox!: HTMLInputElement
    let messageInput!: HTMLTextAreaElement

    const onSubmit = (e: Event) => {
        e.preventDefault()
        setSending(true)
        setInitData(undefined)

        const isPrivate = privateCheckbox.checked
        fetch('/api/shoutbox', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _csrf: props.csrf,
                message: messageInput.value,
                private: isPrivate,
            }),
        })
            .then(res => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error + (data.message ? `: ${data.message}` : ''))
                } else if (isPrivate) {
                    alert('private message sent')
                    messageInput.value = ''
                } else {
                    alert('shout sent! it will appear after moderation')
                    shouts.refetch()
                    messageInput.value = ''
                }

                setSending(false)
            })
    }

    const placeholder = () => {
        if (props.shoutError) return props.shoutError
        if (!jsEnabled()) return '⚠️ please enable javascript to use the form.\nim sorry, but there are just too many spammers out there :c'
        return 'let the void hear you'
    }

    return (

        <section>
            <SectionTitle>shoutbox!</SectionTitle>
            <TextComment class={pageCss.comment}>
                disclaimer: shouts
                {' '}
                <i>are</i>
                {' '}
                pre-moderated, but they do not reflect my&nbsp;views.
            </TextComment>

            <div class={css.form}>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <div class={css.formInput}>
                    <TextArea
                        ref={messageInput}
                        disabled={sending() || !jsEnabled()}
                        class={css.textarea}
                        grow
                        maxRows={5}
                        name="message"
                        placeholder={placeholder()}
                        required
                    />

                    <Button
                        type="submit"
                        onClick={onSubmit}
                        disabled={sending() || !jsEnabled()}
                        title="submit"
                    >
                        <Icon glyph={GravityMegaphone} size={16} />
                    </Button>
                </div>
                <div class={css.formControls}>
                    <Checkbox
                        ref={privateCheckbox}
                        label="make it private"
                        name="private"
                    />
                    <Show when={shouts.data && shouts.data.pageCount > 1}>
                        <div class={css.pagination}>
                            <Show when={page() > 0}>
                                <a
                                    class={css.paginationLink}
                                    rel="external"
                                    href={page() === 1 ? '/' : `?shouts_page=${page() - 1}`}
                                    onClick={onPageClick(false)}
                                    data-astro-reload
                                >
                                    &lt; prev
                                </a>
                            </Show>
                            <span>{page() + 1}</span>
                            <Show when={page() < shouts.data!.pageCount - 1}>
                                <a
                                    class={css.paginationLink}
                                    rel="external"
                                    href={`?shouts_page=${page() + 1}`}
                                    onClick={onPageClick(true)}
                                    data-astro-reload
                                >
                                    next &gt;
                                </a>
                            </Show>
                        </div>
                    </Show>
                </div>
            </div>

            <div class={css.shouts}>
                {shoutsRender()}
            </div>
        </section>
    )
}

export function Shoutbox(props: ComponentProps<typeof ShoutboxInner>) {
    const client = new QueryClient()
    return (
        <QueryClientProvider client={client}>
            <ShoutboxInner {...props} />
        </QueryClientProvider>
    )
}

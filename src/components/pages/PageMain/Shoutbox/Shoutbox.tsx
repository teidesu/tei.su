/* eslint-disable no-alert */
/** @jsxImportSource solid-js */
import { type ComponentProps, Show, createSignal } from 'solid-js'
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

    const shouts = createQuery(() => ({
        queryKey: ['shouts', page()],
        queryFn: () => fetchShouts(page()),
        refetchInterval: 30000,
        placeholderData: keepPreviousData,
        initialData: props.initPageData,
    }))
    const [sending, setSending] = createSignal(false)

    const onPageClick = (next: boolean) => (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

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
                </div>
            </div>
        )
    })

    let form!: HTMLFormElement

    const onSubmit = (e: Event) => {
        e.preventDefault()
        setSending(true)

        const isPrivate = (form.elements.namedItem('private') as HTMLInputElement).checked
        fetch('/api/shoutbox', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _csrf: props.csrf,
                message: (form.elements.namedItem('message') as HTMLInputElement).value,
                private: isPrivate ? '' : undefined,
            }),
        })
            .then(res => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error + (data.message ? `: ${data.message}` : ''))
                } else if (isPrivate) {
                    alert('private message sent')
                    form.reset()
                } else {
                    alert('shout sent! it will appear after moderation')
                    shouts.refetch()
                    form.reset()
                }

                setSending(false)
            })
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

            <form action="/api/shoutbox" class={css.form} method="post" ref={form}>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <div class={css.formInput}>
                    <TextArea
                        disabled={sending()}
                        class={css.textarea}
                        grow
                        maxRows={5}
                        name="message"
                        placeholder={props.shoutError || 'let the void hear you'}
                        required
                    />

                    <Button
                        type="submit"
                        onClick={onSubmit}
                        title="submit"
                    >
                        <Icon glyph={GravityMegaphone} size={16} />
                    </Button>
                </div>
                <Checkbox
                    label="make it private"
                    name="private"
                />
            </form>

            <div class={css.shouts}>
                {shoutsRender()}
            </div>

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

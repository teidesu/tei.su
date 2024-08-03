/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js'
import clsx from 'clsx'

import css from './Emoji.module.css'

export function Emoji(props: JSX.HTMLElementTags['img']) {
    return (
        <img
            {...props}
            class={clsx(css.emoji, props.class)}
        />
    )
}

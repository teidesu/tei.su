/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js/jsx-runtime'
import clsx from 'clsx'

import css from './TextComment.module.css'

export function TextComment(props: JSX.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            class={clsx(css.comment, props.class)}
        />
    )
}

/** @jsxImportSource solid-js */
import clsx from 'clsx'
import type { JSX } from 'solid-js/jsx-runtime'

import css from './Link.module.css'

export function Link(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <a
            {...props}
            class={clsx(css.link, props.class)}
        >
            {props.children}
        </a>
    )
}

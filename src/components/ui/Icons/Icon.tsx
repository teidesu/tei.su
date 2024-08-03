/** @jsxImportSource solid-js */
import type { Component, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import clsx from 'clsx'

import css from './Icon.module.css'

export interface IconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    glyph: Component
    size?: number
}

export function Icon(props: IconProps) {
    const [my, rest] = splitProps(props, ['glyph', 'size', 'class'])

    return (
        <span
            {...rest}
            class={clsx(css.wrap, my.class)}
            style={{
                'font-size': `${my.size ?? 24}px`,
            }}
        >
            {my.glyph({})}
        </span>
    )
}

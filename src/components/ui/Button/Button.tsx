/** @jsxImportSource solid-js */
import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import clsx from 'clsx'

import css from './Button.module.css'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    square?: boolean
}

export function Button(props: ButtonProps) {
    const [my, rest] = splitProps(props, ['square', 'class'])

    return (
        <button
            {...rest}
            class={clsx(
                css.button,
                my.square && css.square,
                my.class,
            )}
        />
    )
}

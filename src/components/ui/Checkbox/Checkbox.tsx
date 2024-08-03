/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js/jsx-runtime'
import { splitProps } from 'solid-js'

import css from './Checkbox.module.css'

export interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    class?: string
    label?: JSX.Element
}

export function Checkbox(props: CheckboxProps) {
    const [my, rest] = splitProps(props, ['label', 'class'])

    const id = `checkbox-${Math.random().toString(36).slice(2)}`

    return (
        <div class={my.class}>
            <input
                {...rest}
                type="checkbox"
                class={css.input}
                id={id}
            />
            <label class={css.label} for={id} tabIndex={0}>
                <div class={css.box} />
                {my.label}
            </label>
        </div>
    )
}

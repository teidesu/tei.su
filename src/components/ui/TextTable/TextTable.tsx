/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js'
import clsx from 'clsx'

import css from './TextTable.module.css'

export interface TextTableProps {
    items: {
        name: string
        value: () => JSX.Element | false | null | undefined
    }[]
    minColumnWidth?: number
    wrap?: boolean
    fill?: boolean
}

export function TextTable(props: TextTableProps) {
    const rows = () => props.items.map((item) => {
        const value = item.value()
        if (!value) return null
        return (
            <tr class={css.line}>
                <td class={css.name}>{item.name}</td>
                <td class={css.value}>{item.value()}</td>
            </tr>
        )
    }).filter(Boolean)

    return (
        <table
            class={clsx(
                css.table,
                props.wrap ? css.wrap : css.normal,
                props.fill && css.fill,
            )}
        >
            {rows()}
        </table>
    )
}

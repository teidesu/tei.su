/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js'

import css from './SectionTitle.module.css'

export function SectionTitle(props: { children: JSX.Element }) {
    return (
        <h3 class={css.sectionTitle}>
            {props.children}
        </h3>
    )
}

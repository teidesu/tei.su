/** @jsxImportSource solid-js */

import type { JSX } from 'solid-js/jsx-runtime'
import { createSignal } from 'solid-js'

import { shuffle } from '~/utils/random'

import css from './RandomWord.module.css'

export interface RandomWordProps {
    choices: JSX.Element[]
}

export function RandomWord(props: RandomWordProps) {
    const [choice, setChoice] = createSignal<JSX.Element>()
    let order: JSX.Element[] = []

    function pickNew() {
        if (order.length === 0) {
            order = shuffle(props.choices)
        }

        setChoice(order.pop())
    }

    function onClick(evt: MouseEvent) {
        evt.preventDefault()
        pickNew()
    }

    pickNew()

    return (
        <div
            class={css.choice}
            onClick={onClick}
        >
            {choice()}
        </div>
    )
}

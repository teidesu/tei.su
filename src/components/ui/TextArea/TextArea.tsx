/** @jsxImportSource solid-js */
import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import clsx from 'clsx'

import css from './TextArea.module.css'

export interface TextAreaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
    grow?: boolean
    maxRows?: number
}

function calculateLinesByScrollHeight(args: {
    height: number
    lineHeight: number
    paddingBottom: number
    paddingTop: number
}) {
    const { height, lineHeight } = args
    const paddingTop = Number.isNaN(args.paddingTop) ? 0 : args.paddingTop
    const paddingBottom = Number.isNaN(args.paddingBottom) ? 0 : args.paddingBottom

    return (height - paddingTop - paddingBottom) / lineHeight
}

export function TextArea(props: TextAreaProps) {
    const [my, rest] = splitProps(props, ['grow', 'class', 'maxRows'])

    const onInput = (e: Event) => {
        // @ts-expect-error lol
        props.onInput?.(e)
        if (!my.grow) return

        const control = e.target as HTMLTextAreaElement

        // based on https://github.com/gravity-ui/uikit/blob/main/src/components/controls/TextArea/TextAreaControl.tsx
        const controlStyles = getComputedStyle(control)
        const lineHeight = Number.parseInt(controlStyles.getPropertyValue('line-height'), 10)
        const paddingTop = Number.parseInt(controlStyles.getPropertyValue('padding-top'), 10)
        const paddingBottom = Number.parseInt(controlStyles.getPropertyValue('padding-bottom'), 10)
        const innerValue = control.value
        const linesWithCarriageReturn = (innerValue?.match(/\n/g) || []).length + 1
        const linesByScrollHeight = calculateLinesByScrollHeight({
            height: control.scrollHeight,
            paddingTop,
            paddingBottom,
            lineHeight,
        })

        control.style.height = 'auto'

        const maxRows = my.maxRows

        if (maxRows && maxRows < Math.max(linesByScrollHeight, linesWithCarriageReturn)) {
            control.style.height = `${maxRows * lineHeight + 2 * paddingTop + 2}px`
        } else if (linesWithCarriageReturn > 1 || linesByScrollHeight > 1) {
            control.style.height = `${control.scrollHeight + 2}px`
        }
    }

    return (
        <textarea
            {...rest}
            class={clsx(css.box, my.class)}
            onInput={onInput}
        />
    )
}

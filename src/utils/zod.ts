import type { z } from 'zod'
import { fromError } from 'zod-validation-error'

export async function zodValidate<T extends z.ZodTypeAny>(schema: T, data: unknown): Promise<z.TypeOf<T>> {
    const res = await schema.safeParseAsync(data)
    if (res.error) throw fromError(res.error)
    return res.data
}

export function zodValidateSync<T extends z.ZodTypeAny>(schema: T, data: unknown): z.TypeOf<T> {
    const res = schema.safeParse(data)
    if (res.error) throw fromError(res.error)
    return res.data
}

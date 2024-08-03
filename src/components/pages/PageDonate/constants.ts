import data from './data.json' with { type: 'json' }

export interface PaymentMethod {
    link?: string
    name: string
    text: string
}

export const PAYMENT_METHODS = data as PaymentMethod[]

import { type ControllablePromise, createControllablePromise } from './promise'

export interface ReloadableParams<T> {
    name: string
    // whether to avoid automatically reloading
    lazy?: boolean
    // whether to return old value while a new one is fetching
    swr?: boolean
    // if `swr` is enabled, whether the stale data can still be used
    swrValidator?: (prev: T, prevTime: number) => boolean
    fetch: (prev: T | null, prevTime: number) => Promise<T>
    expiresIn: (data: T) => number
}

export class Reloadable<T> {
    constructor(readonly params: ReloadableParams<T>) {}

    private data: T | null = null
    private lastFetchTime = 0
    private expiresAt = 0

    private updating?: ControllablePromise<void>
    private timeout?: NodeJS.Timeout

    async update(force = false): Promise<void> {
        if (this.updating) {
            await this.updating
            return
        }

        if (!force && this.data && Date.now() < this.expiresAt) {
            return
        }

        this.updating = createControllablePromise()

        let result
        try {
            result = await this.params.fetch(this.data, this.lastFetchTime)
        } catch (e) {
            console.error(`Failed to fetch ${this.params.name}:`, e)
            this.updating.resolve()
            this.updating = undefined
            return
        }

        this.updating.resolve()
        this.updating = undefined

        this.data = result
        const expiresIn = this.params.expiresIn(result)
        this.lastFetchTime = Date.now()
        this.expiresAt = this.lastFetchTime + expiresIn

        if (!this.params.lazy) {
            if (this.timeout) {
                clearTimeout(this.timeout)
            }
            this.timeout = setTimeout(() => {
                this.update()
            }, expiresIn)
        }
    }

    async get(): Promise<T | null> {
        if (this.params.swr && this.data) {
            const validator = this.params.swrValidator

            if (!validator || validator(this.data, this.expiresAt)) {
                this.update().catch(() => {})
                return this.data
            }
        }

        await this.update()

        return this.data
    }

    getCached(): T | null {
        return this.data
    }
}

export class HttpResponse {
    private constructor() {}

    static json(body: unknown, init?: ResponseInit) {
        return new Response(JSON.stringify(body), {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        })
    }

    static error(status: number) {
        return new Response(null, { status })
    }

    static redirect(url: string, init?: ResponseInit) {
        return new Response(null, {
            status: 301,
            ...init,
            headers: {
                Location: url,
                ...init?.headers,
            },
        })
    }
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle<T>(arr: T[]): T[] {
    return arr.slice().sort(() => Math.random() - 0.5)
}

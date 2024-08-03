import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

export const sqlite = new Database('.runtime/data.db')
export const db = drizzle(sqlite)

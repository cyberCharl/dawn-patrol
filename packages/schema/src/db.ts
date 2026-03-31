import { drizzle } from "drizzle-orm/bun-sqlite"
import { join } from "node:path"
import { homedir } from "node:os"
import { mkdirSync } from "node:fs"
import * as schema from "./tables"

const dataDir = join(homedir(), ".local/share/surf-check")
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, "surf-check.db")

export const db = drizzle({ connection: dbPath, schema })
export type Database = typeof db

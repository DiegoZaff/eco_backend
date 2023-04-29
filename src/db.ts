import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

export interface User {
  username: string
  password: string
  lastCarbonFootprint?: number
  score: number
}

export interface DBSchema {
  users: User[]
}

const adapter = new JSONFile<DBSchema>("./db/db.json")
export const db = new Low(adapter, {
  users: [],
})

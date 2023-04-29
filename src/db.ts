import crypto from "crypto"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

export interface User {
  id: string
  username: string
  password: string
  lastCarbonFootprint?: number
  score: number
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  points: number
  endDate: number
  userCompleted: string[]
}

export interface DBSchema {
  users: User[]
  dailyChallenges: DailyChallenge[]
}

const adapter = new JSONFile<DBSchema>("./db/db.json")
export const db = new Low(adapter, {
  users: [],
  dailyChallenges: [
    {
      id: crypto.randomUUID(),
      title: "Take a 5 minute shower",
      description:
        "Take a 5 minute shower instead of a 10 minute shower, and save 10 gallons of water!",
      points: 5,
      endDate: Date.now() + 1000 * 60 * 60 * 24,
      userCompleted: [],
    },
    {
      id: crypto.randomUUID(),
      title: "Turn off the lights",
      description:
        "Turn off the lights when you leave the room, and save 1 kWh of electricity!",
      points: 2,
      endDate: Date.now() + 1000 * 60 * 60 * 16,
      userCompleted: [],
    },
  ],
})

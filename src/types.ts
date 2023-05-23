export interface User {
  id: string
  username: string
  password: string
  email: string
  last_carbon_footprint?: number
  score: number
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  points: number
  end_date: number
  user_completed: string[]
}


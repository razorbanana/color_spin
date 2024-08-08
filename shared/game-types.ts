export type Participants = {
  [participantID: string]: string;
}

export type Game = {
  id: string;
  initialCredits: number;
  min_bet: number;
  max_bet: number;
  participants: Participants;
  adminID: string;
  hasStarted: boolean;
}
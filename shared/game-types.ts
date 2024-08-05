export interface Participants {
  [participantID: string]: string;
}

export interface Game {
  id: string;
  initialCredits: number;
  min_bet: number;
  max_bet: number;
  participants: Participants;
  adminID: string;
}
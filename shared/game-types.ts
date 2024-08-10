export type Participant = {
  name: string;
  credits: number;
  bet: number | null;
  chosenColor: string | null;
};

export type Participants = {
  [participantID: string]: Participant;
};

export type Game = {
  id: string;
  initialCredits: number;
  max_bet: number;
  participants: Participants;
  adminID: string;
  hasStarted: boolean;
}
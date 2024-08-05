export type CreateTableFields = {
  initialCredits: number;
  min_bet: number;
  max_bet: number;
  name: string;
};

export type JoinTableFields = {
  tableID: string;
  name: string;
};

export type RejoinTableFields = {
  tableID: string;
  userID: string;
  name: string;
};

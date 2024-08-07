//service types

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

//repository types
export type CreateTableData = {
  tableID: string;
  initialCredits: number;
  min_bet: number;
  max_bet: number;
  name: string;
  userID: string;
};

export type AddParticipantData = {
  tableID: string;
  userID: string;
  name: string;
};

//Guard types

type AuthPayload = {
  userID: string;
  tableID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;

export interface Table {
  name: string;
  uuid: string;
  createdAt: Date;
}

export interface Team {
  tableId: number;
  teamId: number;
  rank: number;
  name: string;
  tag: string;
  matchElims: number;
  points: number;
  eliminated: boolean;
}

export interface TeamPoint {
  tableId: number;
  teamId: number;
  points: number;
}

export interface TeamPlayer {
  teamId: number;
  rank: number; // team rank
  uID: number;
  health: number;
  liveState: number; // 0: knocked, 1: alive
  bHasDied: boolean; // true: dead, false: alive
}

export interface TeamEliminated {
  tableUUID: string;
  teamId: number;
  teamName: string;
  matchElims: number;
  rank: number;
}

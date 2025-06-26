export interface Table {
  name: string;
  uuid: string;
  createdAt: Date;
}

export interface Team {
  tableId: number;
  teamId: number;
  name: string;
  tag: string;
  matchElims: number;
  points: number;
}

export interface TeamPoint {
  tableId: number;
  teamId: number;
  points: number;
}

export interface TeamPlayer {
  teamId: number;
  uID: number;
  health: number;
  liveState: number; // 0: knocked, 1: alive
  bHasDied: boolean; // true: dead, false: alive
}

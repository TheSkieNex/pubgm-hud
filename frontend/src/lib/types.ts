export interface Table {
  id: number;
  name: string;
  uuid: string;
  createdAt: Date;
}

export interface Team {
  id: number;
  tableId: number;
  teamId: number;
  name: string;
  tag: string;
  matchElims: number;
  points: number; // Client only
}

export interface TeamPoint {
  id: number;
  tableId: number;
  teamId: number;
  points: number;
}

export interface TeamElim {
  id: number;
  tableId: number;
  teamId: number;
  elim: number;
}

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

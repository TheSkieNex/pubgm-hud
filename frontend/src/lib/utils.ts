import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { API_BASE_URL } from './api';
import type { Table, Team, TeamElim, TeamPoint } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableResponse {
  table: Table;
  teams: Team[];
  teamPoints: TeamPoint[];
  teamElims: TeamElim[];
}

export const fetchTable = async (uuid: string): Promise<TableResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/table/${uuid}`);
  const data = await res.json();

  return {
    table: data.table,
    teams: data.teams,
    teamPoints: data.teamPoints,
    teamElims: data.teams.map((team: Team) => ({
      id: team.id,
      tableId: team.tableId,
      teamId: team.id,
      elim: team.matchElims,
    })),
  };
};

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { API_URL } from './api';
import type { Table, Team } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableResponse {
  table: Table;
  teams: Team[];
}

export const fetchTable = async (uuid: string): Promise<TableResponse> => {
  const res = await fetch(`${API_URL}/tables/${uuid}`);
  const data = await res.json();
  return {
    table: data.table,
    teams: data.teams,
  };
};

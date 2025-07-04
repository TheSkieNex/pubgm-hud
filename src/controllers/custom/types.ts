interface WWCDTeamPlayer {
  name: string;
  eliminations: number;
  knockouts: number;
  grenades_used: number;
  survival_time: number;
}

interface WWCDTeam {
  id: number;
  players: WWCDTeamPlayer[];
}

export interface CustomUpdateWWCDTeamRequest {
  file_uuid: string;
  table_uuid: string;
  team: WWCDTeam;
}

interface MatchResultTeam {
  id: number;
  placement: number;
  eliminations: number;
}

export interface CustomUpdateMatchResultRequest {
  file_uuid: string;
  table_uuid: string;
  teams: MatchResultTeam[];
}

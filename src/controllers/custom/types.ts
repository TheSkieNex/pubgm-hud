interface WWCDTeamPlayer {
  name: string;
  eliminations: number;
  knockouts: number;
  granades_used: number;
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

import { API_URL } from '@/lib/api';
import type { Table, Team, TeamElim, TeamPoint } from '@/lib/types';

interface TableProps {
  table: Table;
  teams: Team[];
  teamPoints: TeamPoint[];
  teamElims: TeamElim[];
}

export const TableComponent = ({ table, teams, teamPoints, teamElims }: TableProps) => {
  return (
    <div className="w-[344px]">
      <HeaderComponent />
      <div className="flex flex-col">
        {teams.map((team, index) => (
          <TeamComponent
            key={team.id}
            id={index + 1}
            teamId={team.teamId}
            tableUUID={table.uuid}
            tag={team.tag}
            points={teamPoints.find(point => point.teamId === team.id)?.points || 0}
            elims={teamElims.find(elim => elim.teamId === team.id)?.elim || 0}
          />
        ))}
      </div>
    </div>
  );
};

const HeaderComponent = () => {
  return (
    <div className="w-full h-[30px] flex bg-table-secondary text-white text-xs font-bold">
      <div className="w-[36px] h-full flex items-center justify-center">#</div>
      <div className="w-[144px] h-full flex items-center justify-center">TEAM</div>
      <div className="w-[60px] h-full flex items-center justify-center">ALIVE</div>
      <div className="w-[52px] h-full flex items-center justify-center">PTS</div>
      <div className="w-[52px] h-full flex items-center justify-center">ELIMS</div>
    </div>
  );
};

interface TeamProps {
  id: number;
  teamId: number;
  tableUUID: string;
  tag: string;
  points: number;
  elims: number;
}

const TeamComponent = ({ id, teamId, tableUUID, tag, points, elims }: TeamProps) => {
  return (
    <div className="w-full h-[42px] flex border-b border-[#EDE9F7] font-circular">
      <div className="w-[36px] h-full flex items-center justify-center bg-table-dark text-white">
        {id}
      </div>
      <div className="w-[144px] h-full flex items-center bg-white text-black">
        <div className="w-[42px] h-full flex items-center justify-center">
          <div
            className="w-7 h-7 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${API_URL}/tables/${tableUUID}/${teamId}.png)` }}
          ></div>
        </div>
        <div className="ml-2">{tag.toUpperCase()}</div>
      </div>
      <div className="flex flex-1 bg-table-dark text-white text-lg">
        <div className="w-[60px] h-full flex items-center justify-center gap-[5px]">
          <div className="w-[3px] h-[26px] bg-table-yellow"></div>
          <div className="w-[3px] h-[26px] bg-table-yellow"></div>
          <div className="w-[3px] h-[26px] bg-table-yellow"></div>
          <div className="w-[3px] h-[26px] bg-table-yellow"></div>
        </div>
        <div className="w-[52px] h-full flex items-center justify-center">{points}</div>
        <div className="w-[52px] h-full flex items-center justify-center">{elims}</div>
      </div>
    </div>
  );
};

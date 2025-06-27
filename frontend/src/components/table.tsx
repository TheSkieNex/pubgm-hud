import { API_BASE_URL } from '@/lib/api';
import type { Table, Team, TeamPlayer } from '@/lib/types';
import { cn } from '@/lib/utils';

import TeamEliminated from './team-eliminated';
import { useEffect, useState } from 'react';

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
  teamPlayers: TeamPlayer[];
  eliminated: boolean;
  rank: number;
}

const TeamComponent = ({
  id,
  teamId,
  tableUUID,
  tag,
  points,
  elims,
  teamPlayers,
  eliminated,
  rank,
}: TeamProps) => {
  const [showEliminated, setShowEliminated] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    if (eliminated) {
      setShowEliminated(true);

      const timer = setTimeout(() => {
        setShowEliminated(false);
        setAnimationFinished(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [eliminated]);

  return (
    <div className="w-full h-[42px] flex border-b border-[#EDE9F7] font-circular relative">
      {eliminated && (
        <>
          <TeamEliminated show={showEliminated} placement={rank} />
          {animationFinished && (
            <div className="w-full h-full bg-black/50 absolute top-0 left-0"></div>
          )}
        </>
      )}
      <div className="w-[36px] h-full flex items-center justify-center bg-table-dark text-white">
        {id}
      </div>
      <div className="w-[144px] h-full flex items-center bg-white text-black">
        <div className="w-[42px] h-full flex items-center justify-center">
          <div
            className="w-7 h-7 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${API_BASE_URL}/tables/${tableUUID}/${teamId}.png)` }}
          ></div>
        </div>
        <div className="ml-2 font-bold">{tag.toUpperCase()}</div>
      </div>
      <div className="flex flex-1 bg-table-dark text-white text-lg">
        <div className="w-[60px] h-full flex items-center justify-center gap-[5px]">
          {teamPlayers.map((player, index) => (
            <div
              key={index}
              className="w-[3px] h-[26px] bg-table-dark-light flex items-end justify-center"
            >
              <div
                className={cn(
                  'w-[3px] h-[26px] transition-all duration-300',
                  player.liveState === 1 ? 'bg-table-yellow' : 'bg-red-500',
                  player.bHasDied && 'bg-transparent'
                )}
                style={player.liveState === 1 ? { height: `${player.health}%` } : {}}
              ></div>
            </div>
          ))}
        </div>
        <div className="w-[52px] h-full flex items-center justify-center">{points}</div>
        <div className="w-[52px] h-full flex items-center justify-center">{elims}</div>
      </div>
    </div>
  );
};

const FooterComponent = () => {
  return (
    <div className="w-full h-[26px] flex items-center gap-5 bg-table-dark text-white text-[10px] leading-[10px] font-bold px-9">
      <div className="flex items-center">
        <div className="w-[8px] h-[8px] bg-table-yellow rounded-[2px]"></div>
        <p className="ml-1">ALIVE</p>
      </div>
      <div className="flex items-center">
        <div className="w-[8px] h-[8px] bg-red-500 rounded-[2px]"></div>
        <p className="ml-1">KNOCKED</p>
      </div>
      <div className="flex items-center">
        <div className="w-[8px] h-[8px] bg-table-dark-light rounded-[2px]"></div>
        <p className="ml-1">ELIMINATED</p>
      </div>
    </div>
  );
};

interface TableProps {
  table: Table;
  teams: Team[];
  teamPlayers: TeamPlayer[];
}

export const TableComponent = ({ table, teams, teamPlayers }: TableProps) => {
  return (
    <div className="w-[344px]">
      <HeaderComponent />
      <div className="flex flex-col">
        {teams.map((team, index) => (
          <TeamComponent
            key={team.teamId}
            id={index + 1}
            teamId={team.teamId}
            tableUUID={table.uuid}
            tag={team.tag}
            points={team.points}
            elims={team.matchElims}
            teamPlayers={teamPlayers.filter(player => player.teamId === team.teamId)}
            eliminated={team.eliminated}
            rank={team.rank}
          />
        ))}
      </div>
      <FooterComponent />
    </div>
  );
};

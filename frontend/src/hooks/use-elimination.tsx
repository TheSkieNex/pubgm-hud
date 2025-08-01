import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { API_ROUTER_URL, socket } from '@/lib/api';
import type { TeamEliminated } from '@/lib/types';

export const useElimination = () => {
  const { uuid } = useParams();

  const animationInProgress = useRef(false);
  const queueRef = useRef<TeamEliminated[]>([]);
  const eliminatedTeamsRef = useRef<Set<string>>(new Set());

  const [tableExists, setTableExists] = useState(false);
  const [eliminatedTeams, setEliminatedTeams] = useState<TeamEliminated[]>([]);
  const [eliminatedTeam, setEliminatedTeam] = useState<TeamEliminated | null>(null);

  useEffect(() => {
    const checkTable = async () => {
      const response = await fetch(`${API_ROUTER_URL}/tables/${uuid}/check`);
      const data = await response.json();
      if (data.success) {
        setTableExists(true);
      }
    };
    checkTable();
  }, [uuid]);

  useEffect(() => {
    socket.on(`team-eliminated-${uuid}`, (data: TeamEliminated[]) => {
      data
        .sort((a, b) => b.rank - a.rank)
        .forEach(team => {
          const teamKey = `${team.teamId}-${team.rank}`;

          if (eliminatedTeamsRef.current.has(teamKey)) {
            return;
          }

          eliminatedTeamsRef.current.add(teamKey);
          queueRef.current.push(team);

          if (!animationInProgress.current) {
            processNextTeam();
          }
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const processNextTeam = async () => {
    const finishProcessing = () => {
      animationInProgress.current = false;
      if (queueRef.current.length > 0) {
        processNextTeam();
      }
    }

    if (queueRef.current.length === 0 || animationInProgress.current) {
      return;
    }

    animationInProgress.current = true;
    const nextTeam = queueRef.current.shift()!;

    const alreadyEliminated = eliminatedTeams.some(team => team.teamId === nextTeam.teamId);
    if (alreadyEliminated) {
      finishProcessing();
      return;
    }

    setEliminatedTeam(nextTeam);
    setEliminatedTeams(prev => [...prev, nextTeam]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setEliminatedTeam(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    finishProcessing();
  };

  return { tableExists, eliminatedTeam };
};

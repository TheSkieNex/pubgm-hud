import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE_URL } from '@/lib/api';
import type { TeamEliminated } from '@/lib/types';

const LeftComponent = ({ logoPath }: { logoPath: string }) => {
  return (
    <div className="w-[100px] h-[100px] flex items-center justify-center bg-white">
      <div
        className="w-16 h-16 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${API_BASE_URL}${logoPath})` }}
      ></div>
    </div>
  );
};

const RightComponent = ({
  teamName,
  rank,
  elims,
}: {
  teamName: string;
  rank: number;
  elims: number;
}) => {
  return (
    <div className="w-[400px] h-[100px] flex flex-col text-white">
      <div className="w-full h-[70px] flex items-center justify-center text-3xl font-bold bg-table-dark">
        {teamName.toUpperCase()}
      </div>
      <div className="w-full h-[30px] flex items-center justify-center gap-8 text-lg font-medium bg-table-secondary">
        <span>#{rank} ELIMINATED</span>
        <span>{elims} ELIMS</span>
      </div>
    </div>
  );
};

export const EliminationComponent = ({ eliminatedTeam }: { eliminatedTeam: TeamEliminated }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!eliminatedTeam) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [eliminatedTeam]);

  if (!eliminatedTeam) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`${eliminatedTeam.teamId}-${eliminatedTeam.rank}`}
          className="w-[500px] h-[100px] flex"
          initial={{ x: -250, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 250, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        >
          <LeftComponent
            logoPath={`/tables/${eliminatedTeam.tableUUID}/${eliminatedTeam.teamId}.png`}
          />
          <RightComponent
            teamName={eliminatedTeam.teamName}
            rank={eliminatedTeam.rank}
            elims={eliminatedTeam.matchElims}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

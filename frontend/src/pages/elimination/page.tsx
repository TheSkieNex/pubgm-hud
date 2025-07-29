import { useElimination } from '@/hooks/use-elimination';

import { EliminationComponent } from '@/components/elimination';

const EliminationPage = () => {
  const { tableExists, eliminatedTeam } = useElimination();

  if (!tableExists || !eliminatedTeam) return null;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <EliminationComponent eliminatedTeam={eliminatedTeam} />
    </div>
  );
};

export default EliminationPage;

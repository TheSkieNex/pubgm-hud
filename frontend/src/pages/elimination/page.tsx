import { useElimination } from '@/hooks/use-elimination';

import { EliminationComponent } from '@/components/elimination';

export default function EliminationPage() {
  const { tableExists, eliminatedTeam } = useElimination();

  if (!tableExists || !eliminatedTeam) return null;

  return <EliminationComponent eliminatedTeam={eliminatedTeam} />;
}

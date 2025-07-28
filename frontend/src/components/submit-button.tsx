import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const SubmitButton = ({ isLoading, label }: { isLoading: boolean; label: string }) => {
  return (
    <Button type="submit" className="w-full bg-main! hover:bg-main-light!" disabled={isLoading}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
    </Button>
  );
};

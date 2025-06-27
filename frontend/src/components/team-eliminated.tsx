import { motion, AnimatePresence } from 'framer-motion';

interface TeamEliminatedProps {
  show: boolean;
  placement: number;
}

const TeamEliminated = ({ show, placement }: TeamEliminatedProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      }}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, duration: 0.3 }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              background: 'white',
              padding: '4px',
              gap: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{ fontSize: '18px', fontWeight: 'bold', color: 'black' }}
            >
              #{placement}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              style={{ fontSize: '18px', fontWeight: 'bold', color: 'black' }}
            >
              ELIMINATED
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamEliminated;

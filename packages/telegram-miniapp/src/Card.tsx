import { motion, AnimatePresence } from "framer-motion";

const variants = {
  hidden: { x: '100vw', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 }},
  exit: { x: '-100vw', opacity: 0, transition: { duration: 0.3 } }
};

export const Card = ({
  children,
  isShown,
}: {
  children: React.ReactNode;
  isShown: boolean;
}) => {
  return (
    <AnimatePresence>
      {isShown && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="Card absolute w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

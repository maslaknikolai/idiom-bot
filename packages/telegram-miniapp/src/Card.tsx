import { motion } from "framer-motion";


export const Slide = ({
  children,
  index,
  shownIndex,
}: {
  children: React.ReactNode;
  index: number;
  shownIndex: number,
}) => {
  const isShown = index === shownIndex;
  const x = `${shownIndex * -100}vw`;

  return (
      <motion.div
        animate={{
          x,
          opacity: isShown ? 1 : 0
        }}
        className="Slide w-full shrink-0"
      >
        {children}
      </motion.div>
  );
};

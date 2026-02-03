import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor } from 'lucide-react';

const Loading = () => {
  const [isPhone, setIsPhone] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsPhone(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex justify-center items-center text-gray-300/80 bg-DarkIndigo">
      <AnimatePresence mode="wait" >
        <motion.div
          className=''
          key={isPhone ? 'phone' : 'monitor'}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -20, 0],
            opacity: 1,
            transition: {
              y: {
                duration: 1,
                ease: "easeOut",
                times: [0, 0.2, 0.4]
              }
            }
          }}
          exit={{ opacity: 0 }}
          transition={{
            y: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 0.2
            },
            opacity: { duration: 0.2 }
          }}
        >
          {isPhone ? (
            <Smartphone className="h-8 w-8" />
          ) : (
            <Monitor className="h-8 w-8" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Loading;
